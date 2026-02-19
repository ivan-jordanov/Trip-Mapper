using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperDAL.RepositoriesSP
{
    public class PinRepositorySP : GenericRepositorySP<Pin>, IPinRepositorySP
    {
        public PinRepositorySP(TripMapperContext context) : base(context, "Pin") { }

        public override async Task<IEnumerable<Pin>> GetAllAsync()
        {
            return await _context.Pins
                .FromSqlRaw("EXEC sp_Pin_GetAll")
                .AsNoTracking()
                .ToListAsync();
        }

        public override async Task<Pin?> GetByIdAsync(int id)
        {
            var pId = new SqlParameter("@Id", id);
            
            var pins = await _context.Pins
                .FromSqlRaw("EXEC sp_Pin_GetById @Id", pId)
                .Include(p => p.Photos)
                .AsNoTracking()
                .ToListAsync();

            return pins.FirstOrDefault();
        }

        public override async Task<Pin> AddAsync(Pin entity)
        {
            var parameters = new[]
            {
                CreateParameter("@Title", entity.Title),
                CreateParameter("@Description", entity.Description),
                CreateParameter("@DateVisited", entity.DateVisited),
                CreateParameter("@CreatedAt", entity.CreatedAt ?? DateTime.UtcNow),
                CreateParameter("@CategoryId", entity.CategoryId),
                CreateParameter("@UserId", entity.UserId),
                CreateParameter("@TripId", entity.TripId),
                CreateParameter("@City", entity.City),
                CreateParameter("@State", entity.State),
                CreateParameter("@Country", entity.Country),
                CreateParameter("@Latitude", entity.Latitude),
                CreateParameter("@Longitude", entity.Longitude),
                CreateOutputParameter("@NewId", SqlDbType.Int)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_Pin_Add";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            using var reader = await cmd.ExecuteReaderAsync();
            
            Pin? newPin = null;
            if (await reader.ReadAsync())
            {
                newPin = MapPinFromReader(reader);
            }

            return newPin ?? throw new Exception("Failed to create pin");
        }

        public override async Task<Pin> UpdateAsync(Pin entity)
        {
            var parameters = new[]
            {
                CreateParameter("@Id", entity.Id),
                CreateParameter("@Title", entity.Title),
                CreateParameter("@Description", entity.Description),
                CreateParameter("@DateVisited", entity.DateVisited),
                CreateParameter("@CategoryId", entity.CategoryId),
                CreateParameter("@TripId", entity.TripId),
                CreateParameter("@City", entity.City),
                CreateParameter("@State", entity.State),
                CreateParameter("@Country", entity.Country),
                CreateParameter("@Latitude", entity.Latitude),
                CreateParameter("@Longitude", entity.Longitude)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_Pin_Update";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            using var reader = await cmd.ExecuteReaderAsync();
            
            Pin? updatedPin = null;
            if (await reader.ReadAsync())
            {
                updatedPin = MapPinFromReader(reader);
            }

            return updatedPin ?? throw new Exception("Failed to update pin");
        }

        public override async Task<bool> DeleteAsync(int id)
        {
            var pId = new SqlParameter("@Id", id);

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_Pin_Delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(pId);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        // Custom methods
        public async Task<Pin?> GetByTitleAsync(string title, int userId)
        {
            return await _context.Pins
                .FirstOrDefaultAsync(u => u.Title == title.ToLower() && u.UserId == userId);
        }

        public async Task<IEnumerable<Pin>> GetPinsForUserAsync(
            int userId,
            string? title,
            DateOnly? visitedFrom,
            DateTime? createdFrom,
            string? category,
            int? page,
            int? pageSize)
        {
            var parameters = new[]
            {
                new SqlParameter("@UserId", userId),
                new SqlParameter("@Title", (object?)title ?? DBNull.Value),
                new SqlParameter("@VisitedFrom", (object?)visitedFrom?.ToDateTime(TimeOnly.MinValue) ?? DBNull.Value),
                new SqlParameter("@CreatedFrom", (object?)createdFrom ?? DBNull.Value),
                new SqlParameter("@Category", (object?)category ?? DBNull.Value),
                new SqlParameter("@Page", page ?? 1),
                new SqlParameter("@PageSize", pageSize ?? 50)
            };

            var pins = await _context.Pins
                .FromSqlRaw("EXEC dbo.GetPinsForUserPaged @UserId, @Title, @VisitedFrom, @CreatedFrom, @Category, @Page, @PageSize", parameters)
                .AsNoTracking()
                .ToListAsync();

            if (pins.Count == 0)
            {
                return pins;
            }

            var pinIds = pins.Select(pin => pin.Id).ToList();
            var photos = await _context.Photos
                .Where(photo => photo.PinId.HasValue && pinIds.Contains(photo.PinId.Value))
                .AsNoTracking()
                .ToListAsync();

            var photosByPinId = photos.ToLookup(photo => photo.PinId!.Value);

            foreach (var pin in pins)
            {
                pin.Photos = photosByPinId[pin.Id].ToList();
            }

            return pins;
        }

        public async Task<int> GetPinsCountForUserAsync(
            int userId,
            string? title,
            DateOnly? visitedFrom,
            DateTime? createdFrom,
            string? category)
        {
            var parameters = new[]
            {
                new SqlParameter("@UserId", userId),
                new SqlParameter("@Title", (object?)title ?? DBNull.Value),
                new SqlParameter("@VisitedFrom", (object?)visitedFrom?.ToDateTime(TimeOnly.MinValue) ?? DBNull.Value),
                new SqlParameter("@CreatedFrom", (object?)createdFrom ?? DBNull.Value),
                new SqlParameter("@Category", (object?)category ?? DBNull.Value)
            };

            var counts = await _context.Database
                .SqlQueryRaw<int>("EXEC dbo.GetPinsForUserCount @UserId, @Title, @VisitedFrom, @CreatedFrom, @Category", parameters)
                .ToListAsync();

            return counts.Single();
        }

        public async Task<List<Pin>> GetPinsForTripUpdateAsync(int userId, int tripId, List<string> targetTitlesLower)
        {
            // SQL Server doesnt accept lists, so send as csv
            string csv = string.Join(",", targetTitlesLower.Select(t => t.ToLower()));

            var pUserId = new SqlParameter("@UserId", userId);
            var pTripId = new SqlParameter("@TripId", tripId);
            var pTitleCsv = new SqlParameter("@TitleCsv", csv);

            return await _context.Pins
                .FromSqlRaw("EXEC dbo.Pin_GetForTripUpdate @UserId, @TripId, @TitleCsv", pUserId, pTripId, pTitleCsv)
                .AsNoTracking()
                .ToListAsync();
        }
        public async Task<List<int>> GetPinIdsByTitlesAsync(int userId, List<string> titles)
        {
            string csv = string.Join(",", titles.Select(t => t.ToLower()));

            var pUserId = new SqlParameter("@UserId", userId);
            var pTitleCsv = new SqlParameter("@TitleCsv", csv);

            var result = await _context.Database
                .SqlQueryRaw<int>("EXEC dbo.Pin_GetIdsByTitles @UserId, @TitleCsv", pUserId, pTitleCsv)
                .ToListAsync();

            return result;
        }

        // Helper method
        private Pin MapPinFromReader(System.Data.Common.DbDataReader reader)
        {
            return new Pin
            {
                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                Title = reader["Title"] as string,
                Description = reader["Description"] as string,
                DateVisited = reader["DateVisited"] as DateOnly?,
                CreatedAt = reader["CreatedAt"] as DateTime?,
                CategoryId = reader.GetInt32(reader.GetOrdinal("CategoryId")),
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                TripId = reader["TripId"] as int?,
                City = reader["City"] as string,
                State = reader["State"] as string,
                Country = reader["Country"] as string,
                Latitude = reader["Latitude"] as decimal?,
                Longitude = reader["Longitude"] as decimal?
            };
        }
    }
}
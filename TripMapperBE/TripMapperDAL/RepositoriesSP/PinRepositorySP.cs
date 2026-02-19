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

        public async Task<IEnumerable<Pin>> GetPinsForUserAsync(int currentUserId, string? title, DateOnly? visitedFrom, DateTime? createdFrom, string? category, int? page, int? pageSize)
        {
            var query = _context.Pins
                .Where(p => p.UserId == currentUserId)
                .Where(p =>
                    (title == null || EF.Functions.Like(p.Title, $"%{title}%")) &&
                    (!visitedFrom.HasValue ||
                        (p.DateVisited.HasValue && p.DateVisited.Value >= visitedFrom.Value)) &&
                    (!createdFrom.HasValue ||
                        (p.CreatedAt.HasValue && p.CreatedAt.Value >= createdFrom.Value)) &&
                    (category == null || (p.Category != null && p.Category.Name == category))
                )
                .Include(p => p.Photos)
                .OrderBy(p => p.Id);

            int skip = ((page ?? 1) - 1) * (pageSize ?? 50);
            int take = pageSize ?? 50;

            return await query.Skip(skip).Take(take).ToListAsync();
        }

        public async Task<int> GetPinsCountForUserAsync(int currentUserId, string? title, DateOnly? visitedFrom, DateTime? createdFrom, string? category)
        {
            return await _context.Pins
                .Where(p => p.UserId == currentUserId)
                .Where(p =>
                    (title == null || EF.Functions.Like(p.Title, $"%{title}%")) &&
                    (!visitedFrom.HasValue ||
                        (p.DateVisited.HasValue && p.DateVisited.Value >= visitedFrom.Value)) &&
                    (!createdFrom.HasValue ||
                        (p.CreatedAt.HasValue && p.CreatedAt.Value >= createdFrom.Value)) &&
                    (category == null || (p.Category != null && p.Category.Name == category))
                )
                .CountAsync();
        }

        public async Task<List<Pin>> GetPinsForTripUpdateAsync(int userId, int tripId, List<string> targetTitlesLower)
        {
            var pins = await _context.Pins
                .Where(p => p.UserId == userId)
                .Where(p => p.TripId == tripId || p.TripId == null)
                .ToListAsync();
            
            return pins
                .Where(p => p.TripId == tripId || 
                           (p.Title != null && targetTitlesLower.Contains(p.Title.ToLower())))
                .ToList();
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

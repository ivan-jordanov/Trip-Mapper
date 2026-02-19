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
    public class TripRepositorySP : GenericRepositorySP<Trip>, ITripRepositorySP
    {
        public TripRepositorySP(TripMapperContext context) : base(context, "Trip") { }

        public override async Task<IEnumerable<Trip>> GetAllAsync()
        {
            return await _context.Trips
                .FromSqlRaw("EXEC sp_Trip_GetAll")
                .AsNoTracking()
                .ToListAsync();
        }

        public override async Task<Trip?> GetByIdAsync(int id)
        {
            var pId = new SqlParameter("@Id", id);
            
            var trips = await _context.Trips
                .FromSqlRaw("EXEC sp_Trip_GetById @Id", pId)
                .AsNoTracking()
                .ToListAsync();

            return trips.FirstOrDefault();
        }

        public override async Task<Trip> AddAsync(Trip entity)
        {
            var parameters = new[]
            {
                CreateParameter("@Title", entity.Title),
                CreateParameter("@Description", entity.Description),
                CreateParameter("@DateVisited", entity.DateVisited),
                CreateParameter("@DateFrom", entity.DateFrom),
                CreateOutputParameter("@NewId", SqlDbType.Int)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_Trip_Add";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            using var reader = await cmd.ExecuteReaderAsync();
            
            Trip? newTrip = null;
            if (await reader.ReadAsync())
            {
                newTrip = new Trip
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Title = reader.GetString(reader.GetOrdinal("Title")),
                    Description = reader["Description"] as string,
                    DateVisited = reader["DateVisited"] as DateOnly?,
                    DateFrom = reader["DateFrom"] as DateOnly?,
                    RowVersion = (byte[])reader["RowVersion"]
                };
            }

            return newTrip ?? throw new Exception("Failed to create trip");
        }

        public override async Task<Trip> UpdateAsync(Trip entity)
        {
            var parameters = new[]
            {
                CreateParameter("@Id", entity.Id),
                CreateParameter("@Title", entity.Title),
                CreateParameter("@Description", entity.Description),
                CreateParameter("@DateVisited", entity.DateVisited),
                CreateParameter("@DateFrom", entity.DateFrom),
                CreateParameter("@RowVersion", entity.RowVersion)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_Trip_Update";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            try
            {
                using var reader = await cmd.ExecuteReaderAsync();
                
                Trip? updatedTrip = null;
                if (await reader.ReadAsync())
                {
                    updatedTrip = new Trip
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        Title = reader.GetString(reader.GetOrdinal("Title")),
                        Description = reader["Description"] as string,
                        DateVisited = reader["DateVisited"] as DateOnly?,
                        DateFrom = reader["DateFrom"] as DateOnly?,
                        RowVersion = (byte[])reader["RowVersion"]
                    };
                }

                return updatedTrip ?? throw new DbUpdateConcurrencyException("Trip was modified by another user");
            }
            catch (SqlException ex) when (ex.Number == 50001)
            {
                throw new DbUpdateConcurrencyException("Trip was modified by another user", ex);
            }
        }

        public override async Task<bool> DeleteAsync(int id)
        {
            var pId = new SqlParameter("@Id", id);

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_Trip_Delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(pId);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        // Custom methods (keep existing SP implementations)
        public async Task<Trip?> GetByTitleAsync(string title, int userId)
        {
            var pTitle = new SqlParameter("@Title", title);
            var pUserId = new SqlParameter("@UserId", userId);

            var trips = await _context.Trips
                .FromSqlRaw("EXEC dbo.Trip_GetByTitleForOwner @Title, @UserId", pTitle, pUserId)
                .AsNoTracking()
                .ToListAsync();

            var trip = trips.FirstOrDefault();
            if (trip == null)
            {
                return null;
            }

            trip.TripAccesses = await _context.TripAccesses
                .Where(access => access.TripId == trip.Id)
                .AsNoTracking()
                .ToListAsync();

            return trip;
        }

        public async Task<Trip?> GetTripWithAccessesAsync(int tripId)
        {
            var conn = _context.Database.GetDbConnection();
            var shouldClose = conn.State == ConnectionState.Closed;
            
            if (shouldClose)
            {
                await conn.OpenAsync();
            }

            try
            {
                using var cmd = conn.CreateCommand();
                cmd.CommandText = "dbo.Trip_GetWithAccesses";
                cmd.CommandType = CommandType.StoredProcedure;

                var p = cmd.CreateParameter();
                p.ParameterName = "@TripId";
                p.Value = tripId;
                cmd.Parameters.Add(p);

                using var reader = await cmd.ExecuteReaderAsync();

                // SP bara poslozena logika, bidejki vrakjame 2 rezult sets (trip + negovi trip accesses)

                // Result Set 1
                Trip? trip = null;
                if (await reader.ReadAsync())
                {
                    trip = new Trip
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        Title = reader.GetString(reader.GetOrdinal("Title")),
                        Description = reader["Description"] as string,
                        DateFrom = reader["DateFrom"] as DateOnly?,
                        DateVisited = reader["DateVisited"] as DateOnly?,
                        RowVersion = (byte[])reader["RowVersion"]
                    };
                }

                if (trip == null)
                    return null;

                await reader.NextResultAsync();

                // Result Set 2
                trip.TripAccesses = new List<TripAccess>();

                while (await reader.ReadAsync())
                {
                    trip.TripAccesses.Add(new TripAccess
                    {
                        TripId = trip.Id,
                        UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                        AccessLevel = reader.GetString(reader.GetOrdinal("AccessLevel"))
                    });
                }

                return trip;
            }
            finally
            {
                if (shouldClose && conn.State == ConnectionState.Open)
                {
                    await conn.CloseAsync();
                }
            }
        }

        public async Task<IEnumerable<Trip>> GetTripsForUserAsync(int userId, string? title, DateOnly? dateFrom, DateOnly? dateTo, int? page, int? pageSize)
        {       
            title = string.IsNullOrWhiteSpace(title) ? null : title;

            var query = _context.TripAccesses
                .Where(x => x.UserId == userId)
                .Include(x => x.Trip)
                    .ThenInclude(t => t.Photos)
                .Where(x =>
                    (title == null || EF.Functions.Like(x.Trip.Title, $"%{title}%")) &&
                    (!dateFrom.HasValue || !dateTo.HasValue || dateFrom.Value < dateTo.Value) &&
                    (!dateFrom.HasValue ||
                        (x.Trip.DateFrom.HasValue && x.Trip.DateFrom.Value >= dateFrom.Value)) &&
                    (!dateTo.HasValue ||
                        (x.Trip.DateVisited.HasValue && x.Trip.DateVisited.Value <= dateTo.Value)))
                .Select(x => x.Trip)
                .OrderBy(t => t.Id);

            int skip = ((page ?? 1) - 1) * (pageSize ?? 50);
            int take = pageSize ?? 50;

            return await query.Skip(skip).Take(take).ToListAsync();
        }

        public async Task<int> GetTripsCountForUserAsync(int userId, string? title, DateOnly? dateFrom, DateOnly? dateTo)
        {
            title = string.IsNullOrWhiteSpace(title) ? null : title;

            return await _context.TripAccesses
                .Where(x => x.UserId == userId)
                .Include(x => x.Trip)
                .Where(x =>
                    (title == null || EF.Functions.Like(x.Trip.Title, $"%{title}%")) &&
                    (!dateFrom.HasValue || !dateTo.HasValue || dateFrom.Value < dateTo.Value) &&
                    (!dateFrom.HasValue ||
                        (x.Trip.DateFrom.HasValue && x.Trip.DateFrom.Value >= dateFrom.Value)) &&
                    (!dateTo.HasValue ||
                        (x.Trip.DateVisited.HasValue && x.Trip.DateVisited.Value <= dateTo.Value)))
                .Select(x => x.Trip)
                .CountAsync();
        }

        public async Task<Trip?> GetTripWithDetailsAsync(int id)
        {
            var pId = new SqlParameter("@TripId", id);

            var trips = await _context.Trips
                .FromSqlRaw("EXEC dbo.Trip_GetById @TripId", pId)
                .AsNoTracking()
                .ToListAsync();

            var trip = trips.FirstOrDefault();
            if (trip == null)
            {
                return null;
            }

            var pins = await _context.Pins
                .Where(pin => pin.TripId == trip.Id)
                .AsNoTracking()
                .ToListAsync();

            if (pins.Count > 0)
            {
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
            }

            trip.Pins = pins;

            return trip;
        }

        public void Attach(Trip entity)
        {
            _context.Set<Trip>().Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }

        public void SetOriginalRowVersion(Trip entity, byte[] rowVersion)
        {
            _context.Entry(entity).Property("RowVersion").OriginalValue = rowVersion;
        }

        public void ClearTracking()
        {
            _context.ChangeTracker.Clear();
        }
    }
}

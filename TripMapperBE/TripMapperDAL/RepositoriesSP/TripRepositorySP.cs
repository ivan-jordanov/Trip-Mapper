using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperDAL.Repositories
{
    public class TripRepositorySp : GenericRepository<Trip>, ITripRepository
    {
        public TripRepositorySp(TripMapperContext context) : base(context) { }

        public async Task<Trip?> GetByTitleAsync(string title, int userId)
        {
            var pTitle = new SqlParameter("@Title", title);
            var pUserId = new SqlParameter("@UserId", userId);

            var trips = await _context.Trips
                .FromSqlRaw("EXEC dbo.Trip_GetByTitleForOwner @Title, @UserId", pTitle, pUserId)
                .Include(t => t.TripAccesses)
                .AsNoTracking()
                .ToListAsync();

            return trips.FirstOrDefault();
        }

        public async Task<Trip?> GetTripWithAccessesAsync(int tripId)
        {
            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();

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
                .Include(t => t.Pins)
                    .ThenInclude(p => p.Photos)
                .AsNoTracking()
                .ToListAsync();

            return trips.FirstOrDefault();
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

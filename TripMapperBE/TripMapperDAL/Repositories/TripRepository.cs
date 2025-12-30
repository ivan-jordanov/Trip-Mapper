using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperDAL.Repositories
{
    public class TripRepository : GenericRepository<Trip>, ITripRepository
    {
        public TripRepository(TripMapperContext context) : base(context) { }

        public async Task<Trip?> GetByTitleAsync(string title, int userId)
        {
            return await _context.Trips
                .Include(t => t.TripAccesses)
                .FirstOrDefaultAsync(t =>
                    t.Title == title &&
                    t.TripAccesses.Any(a =>
                        a.UserId == userId &&
                        a.AccessLevel == "Owner"
                    )
                );
        }


        public async Task<IEnumerable<Trip>> GetTripsForUserAsync(int userId, string? title, DateOnly? dateFrom, DateOnly? dateTo)
        {
            title = string.IsNullOrWhiteSpace(title) ? null : title;

            return await _context.TripAccesses
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
                .ToListAsync();
        }






        public async Task<Trip?> GetTripWithDetailsAsync(int id)
        {
            return await _context.Trips
                .Include(t => t.Photos)
                .Include(t => t.Pins)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Trip?> GetTripWithAccessesAsync(int tripId)
        {
            return await _context.Trips
                .Include(t => t.TripAccesses)
                .FirstOrDefaultAsync(t => t.Id == tripId);
        }


        public void Attach(Trip entity)
        {
            _context.Set<Trip>().Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }
        
        // Check if rowVersion in DB is same as rowVersion from user (i.e. different if someone else modified it before current user)
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

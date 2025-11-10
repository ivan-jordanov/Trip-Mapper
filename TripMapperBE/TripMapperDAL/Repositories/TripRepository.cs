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

        public async Task<IEnumerable<Trip>> GetTripsForUserAsync(int userId)
        {
            return await _context.TripAccesses
                .Where(x => x.UserId == userId)
                .Select(x => x.Trip)
                .ToListAsync();
        }

        public async Task<Trip?> GetTripWithDetailsAsync(int id)
        {
            return await _context.Trips
                .Include(t => t.Pins)
                    .ThenInclude(p => p.Photos)
                .FirstOrDefaultAsync(t => t.Id == id);
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

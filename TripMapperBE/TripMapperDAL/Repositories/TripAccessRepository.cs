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
    public class TripAccessRepository : GenericRepository<TripAccess>, ITripAccessRepository
    {
        public TripAccessRepository(TripMapperContext context) : base(context) { }

        public async Task<TripAccess?> GetAccessAsync(int tripId, int userId)
        {
            return await _context.TripAccesses
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.TripId == tripId && x.UserId == userId);
        }

        public async Task<List<TripAccess>> GetByTripIdAsync(int tripId)
        {
            return await _context.TripAccesses
                .Include(x => x.User)
                .Where(x => x.TripId == tripId)
                .ToListAsync();
        }

        public async Task<bool> DeleteAsync(int tripId, int userId)
        {
            var access = await _context.TripAccesses
                .FirstOrDefaultAsync(x => x.TripId == tripId && x.UserId == userId);

            if (access == null) return false;

            _context.TripAccesses.Remove(access);
            return true;
        }
    }
}

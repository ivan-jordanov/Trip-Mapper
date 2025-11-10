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
                .FirstOrDefaultAsync(x => x.TripId == tripId && x.UserId == userId);
        }

        public async Task<List<TripAccess>> GetByTripIdAsync(int tripId)
        {
            return await _context.TripAccesses
                .Where(x => x.TripId == tripId)
                .ToListAsync();
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDB.Models;
using TripMapperDAL.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace TripMapperDAL.Repositories
{
    public class PhotoRepository : GenericRepository<Photo>, IPhotoRepository
    {
        public PhotoRepository(TripMapperContext context) : base(context) { }

        public async Task<List<Photo>> GetPhotosByPinIdsAsync(List<int> pinIds)
        {
            return await _context.Photos
                .Where(ph => ph.PinId != null && pinIds.Contains(ph.PinId.Value))
                .ToListAsync();
        }

        public async Task<List<Photo>> GetPhotosByPinIdsOrTripIdAsync(List<int> pinIds, int tripId)
        {
            return await _context.Photos
                .Where(ph =>
                    (ph.PinId != null && pinIds.Contains(ph.PinId.Value)) ||
                    ph.TripId == tripId)
                .ToListAsync();
        }

        public async Task<List<Photo>> GetPhotosByTripIdAsync(int tripId)
        {
            return await _context.Photos
                .Where(ph => ph.TripId == tripId)
                .ToListAsync();
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDB.Models;
using TripMapperDAL.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace TripMapperDAL.Repositories
{
    public class PhotoRepositorySp : GenericRepository<Photo>, IPhotoRepository
    {
        public PhotoRepositorySp(TripMapperContext context) : base(context) { }

        public async Task<List<Photo>> GetPhotosByPinIdsAsync(List<int> pinIds)
        {
            string csv = string.Join(",", pinIds);

            var pPinIdsCsv = new SqlParameter("@PinIdsCsv", csv);

            return await _context.Photos
                .FromSqlRaw("EXEC dbo.Photo_GetByPinIds @PinIdsCsv", pPinIdsCsv)
                .ToListAsync();
        }

        public async Task<List<Photo>> GetPhotosByPinIdsOrTripIdAsync(List<int> pinIds, int tripId)
        {
            string csv = string.Join(",", pinIds);

            var pPinIdsCsv = new SqlParameter("@PinIdsCsv", csv);
            var pTripId = new SqlParameter("@TripId", tripId);

            return await _context.Photos
                .FromSqlRaw("EXEC dbo.Photo_GetByPinIdsOrTripId @PinIdsCsv, @TripId", pPinIdsCsv, pTripId)
                .ToListAsync();
        }

        public async Task<List<Photo>> GetPhotosByTripIdAsync(int tripId)
        {
            var pTripId = new SqlParameter("@TripId", tripId);

            return await _context.Photos
                .FromSqlRaw("EXEC dbo.Photo_GetByTripId @TripId", pTripId)
                .ToListAsync();
        }
    }
}

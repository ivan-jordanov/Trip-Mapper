using Microsoft.Data.SqlClient;
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
    public class TripAccessRepositorySp : GenericRepository<TripAccess>, ITripAccessRepository
    {
        public TripAccessRepositorySp(TripMapperContext context) : base(context) { }

        public async Task<TripAccess?> GetAccessAsync(int tripId, int userId)
        {
            var pTripId = new SqlParameter("@TripId", tripId);
            var pUserId = new SqlParameter("@UserId", userId);

            var list = await _context.TripAccesses
                .FromSqlRaw("EXEC dbo.TripAccess_GetAccess @TripId, @UserId", pTripId, pUserId)
                .AsNoTracking()
                .ToListAsync();

            return list.FirstOrDefault();
        }

        public async Task<List<TripAccess>> GetByTripIdAsync(int tripId)
        {
            var pTripId = new SqlParameter("@TripId", tripId);

            var list = await _context.TripAccesses
                .FromSqlRaw("EXEC dbo.TripAccess_GetByTripId @TripId", pTripId)
                .AsNoTracking()
                .ToListAsync();

            return list;
        }
    }
}

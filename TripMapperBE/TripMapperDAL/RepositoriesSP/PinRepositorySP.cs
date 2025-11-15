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
    public class PinRepositorySp : GenericRepository<Pin>, IPinRepository
    {
        public PinRepositorySp(TripMapperContext context) : base(context) { }

        public async Task<Pin?> GetByTitleAsync(string title, int userId)
        {
            var pTitle = new SqlParameter("@Title", title.ToLower());
            var pUserId = new SqlParameter("@UserId", userId);

            var pins = await _context.Pins
                .FromSqlRaw("EXEC dbo.Pin_GetByTitleForUser @Title, @UserId", pTitle, pUserId)
                .AsNoTracking()
                .ToListAsync();

            return pins.FirstOrDefault();
        }

        public async Task<IEnumerable<Pin>> GetPinsForUserAsync(
            int currentUserId,
            string? title,
            DateOnly? visitedFrom,
            DateTime? createdFrom,
            string? category)
        {
            var pUserId = new SqlParameter("@UserId", currentUserId);
            var pTitle = new SqlParameter("@Title", (object?)title ?? DBNull.Value);
            var pVisitedFrom = new SqlParameter("@VisitedFrom", (object?)visitedFrom ?? DBNull.Value);
            var pCreatedFrom = new SqlParameter("@CreatedFrom", (object?)createdFrom ?? DBNull.Value);
            var pCategory = new SqlParameter("@Category", (object?)category ?? DBNull.Value);

            var pins = await _context.Pins
                .FromSqlRaw(
                    "EXEC dbo.Pin_GetPinsForUser @UserId, @Title, @VisitedFrom, @CreatedFrom, @Category",
                    pUserId, pTitle, pVisitedFrom, pCreatedFrom, pCategory)
                .Include(p => p.Category)
                .AsNoTracking()
                .ToListAsync();

            return pins;
        }

        public async Task<List<Pin>> GetPinsForTripUpdateAsync(int userId, int tripId, List<string> targetTitlesLower)
        {
            // SQL Server doesnt accept lists, so send as csv
            string csv = string.Join(",", targetTitlesLower.Select(t => t.ToLower()));

            return await _context.Pins
                .FromSqlRaw("EXEC dbo.Pin_GetForTripUpdate @UserId={0}, @TripId={1}, @TitleCsv={2}",
                            userId, tripId, csv)
                .ToListAsync();
        }
    }
}

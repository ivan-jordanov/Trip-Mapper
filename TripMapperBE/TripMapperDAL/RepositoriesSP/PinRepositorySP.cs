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
    int userId,
    string? title,
    DateOnly? visitedFrom,
    DateTime? createdFrom,
    string? category,
    int? page,
    int? pageSize)
        {
            var parameters = new[]
            {
                new SqlParameter("@UserId", userId),
                new SqlParameter("@Title", (object?)title ?? DBNull.Value),
                new SqlParameter("@VisitedFrom", (object?)visitedFrom?.ToDateTime(TimeOnly.MinValue) ?? DBNull.Value),
                new SqlParameter("@CreatedFrom", (object?)createdFrom ?? DBNull.Value),
                new SqlParameter("@Category", (object?)category ?? DBNull.Value),
                new SqlParameter("@Page", page ?? 1),
                new SqlParameter("@PageSize", pageSize ?? 50)
            };

            var pins = await _context.Pins
                .FromSqlRaw("EXEC dbo.GetPinsForUserPaged @UserId, @Title, @VisitedFrom, @CreatedFrom, @Category, @Page, @PageSize", parameters)
                .AsNoTracking()
                .ToListAsync();

            if (pins.Count == 0)
            {
                return pins;
            }

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

            return pins;
        }

        public async Task<int> GetPinsCountForUserAsync(
            int userId,
            string? title,
            DateOnly? visitedFrom,
            DateTime? createdFrom,
            string? category)
        {
            var parameters = new[]
            {
                new SqlParameter("@UserId", userId),
                new SqlParameter("@Title", (object?)title ?? DBNull.Value),
                new SqlParameter("@VisitedFrom", (object?)visitedFrom?.ToDateTime(TimeOnly.MinValue) ?? DBNull.Value),
                new SqlParameter("@CreatedFrom", (object?)createdFrom ?? DBNull.Value),
                new SqlParameter("@Category", (object?)category ?? DBNull.Value)
            };

            var counts = await _context.Database
                .SqlQueryRaw<int>("EXEC dbo.GetPinsForUserCount @UserId, @Title, @VisitedFrom, @CreatedFrom, @Category", parameters)
                .ToListAsync();

            return counts.Single();
        }


        public async Task<List<Pin>> GetPinsForTripUpdateAsync(int userId, int tripId, List<string> targetTitlesLower)
        {
            // SQL Server doesnt accept lists, so send as csv
            string csv = string.Join(",", targetTitlesLower.Select(t => t.ToLower()));

            var pUserId = new SqlParameter("@UserId", userId);
            var pTripId = new SqlParameter("@TripId", tripId);
            var pTitleCsv = new SqlParameter("@TitleCsv", csv);

            return await _context.Pins
                .FromSqlRaw("EXEC dbo.Pin_GetForTripUpdate @UserId, @TripId, @TitleCsv", pUserId, pTripId, pTitleCsv)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<List<int>> GetPinIdsByTitlesAsync(int userId, List<string> titles)
        {
            string csv = string.Join(",", titles.Select(t => t.ToLower()));

            var pUserId = new SqlParameter("@UserId", userId);
            var pTitleCsv = new SqlParameter("@TitleCsv", csv);

            var result = await _context.Database
                .SqlQueryRaw<int>("EXEC dbo.Pin_GetIdsByTitles @UserId, @TitleCsv", pUserId, pTitleCsv)
                .ToListAsync();

            return result;
        }
    }
}

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
    public class PinRepository : GenericRepository<Pin>, IPinRepository
    {
        public PinRepository(TripMapperContext context) : base(context) { }

        public override async Task<Pin?> GetByIdAsync(int id)
        {
            return await _context.Pins
                .Include(p => p.Photos)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Pin?> GetByTitleAsync(string title, int userId)
        {
            return await _context.Pins.FirstOrDefaultAsync(u => u.Title == title.ToLower() && u.UserId == userId);
        }

        public async Task<IEnumerable<Pin>> GetPinsForUserAsync(int currentUserId, string? title, DateOnly? visitedFrom, DateTime? createdFrom, string? category, int? page, int? pageSize)
        {
            return await _context.Pins
            .Where(p => p.UserId == currentUserId)
            .Where(p =>
                (title == null || EF.Functions.Like(p.Title, $"%{title}%")) &&
                
                (!visitedFrom.HasValue ||
                    (p.DateVisited.HasValue && p.DateVisited.Value >= visitedFrom.Value)) &&
                (!createdFrom.HasValue ||
                    (p.CreatedAt.HasValue && p.CreatedAt.Value >= createdFrom.Value)) &&
                (category == null || (p.Category != null && p.Category.Name == category))
            ).Skip(((page ?? 1) - 1) * (pageSize ?? 50))
             .Take(pageSize ?? 50)
            .Include(p => p.Photos)
            .ToListAsync();

        }

        public async Task<int> GetPinsCountForUserAsync(int currentUserId, string? title, DateOnly? visitedFrom, DateTime? createdFrom, string? category)
        {
            return await _context.Pins
            .Where(p => p.UserId == currentUserId)
            .Where(p =>
                (title == null || EF.Functions.Like(p.Title, $"%{title}%")) &&
                
                (!visitedFrom.HasValue ||
                    (p.DateVisited.HasValue && p.DateVisited.Value >= visitedFrom.Value)) &&
                (!createdFrom.HasValue ||
                    (p.CreatedAt.HasValue && p.CreatedAt.Value >= createdFrom.Value)) &&
                (category == null || (p.Category != null && p.Category.Name == category))
            )
            .CountAsync();

        }

        public async Task<List<Pin>> GetPinsForTripUpdateAsync(
        int userId,
        int tripId,
        List<string> targetTitlesLower)
        {
            var pins = await _context.Pins
                .Where(p => p.UserId == userId)
                .Where(p => p.TripId == tripId || p.TripId == null)
                .ToListAsync();
            
            return pins
                .Where(p => p.TripId == tripId || 
                           (p.Title != null && targetTitlesLower.Contains(p.Title.ToLower())))
                .ToList();
        }
    }
}

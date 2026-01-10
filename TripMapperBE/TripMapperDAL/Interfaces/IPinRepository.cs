using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface IPinRepository : IGenericRepository<Pin> {
        Task<Pin?> GetByTitleAsync(string title, int userId);
        Task<IEnumerable<Pin>> GetPinsForUserAsync(int currentUserId, string? title, DateOnly? visitedFrom, DateTime? createdFrom, string? category, int? page, int? pageSize);
        Task<int> GetPinsCountForUserAsync(int currentUserId, string? title, DateOnly? visitedFrom, DateTime? createdFrom, string? category);

        Task<List<Pin>> GetPinsForTripUpdateAsync(int userId, int tripId, List<string> targetTitlesLower);
    }
}

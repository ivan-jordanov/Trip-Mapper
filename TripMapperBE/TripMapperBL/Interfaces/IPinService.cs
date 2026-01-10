using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperBL.DTOs;

namespace TripMapperBL.Interfaces
{
    public interface IPinService
    {
        Task<IEnumerable<PinDto>> GetPinsAsync(int currentUserId, string? title, DateOnly? visitedFrom, DateTime? createdFrom, string? category, int? page, int? pageSize);
        Task<int> GetPinsCountAsync(int currentUserId, string? title, DateOnly? visitedFrom, DateTime? createdFrom, string? category);
        Task<PinDto?> GetPinByIdAsync(int id, int currentUserId);
        Task<PinDto?> CreatePinAsync(CreatePinDto dto, int currentUserId, double latitude, double longitude);
        Task<bool> DeletePinAsync(int id, int currentUserId);
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperBL.DTOs;

namespace TripMapperBL.Interfaces
{
    public interface ITripService
    {
        Task<IEnumerable<TripDto>> GetAllTripsAsync(int currentUserId, string? title, DateOnly? dateFrom);
        Task<TripDto?> GetTripByIdAsync(int id, int currentUserId);
        Task<TripDto?> CreateTripAsync(CreateTripDto dto, int currentUserId);
        Task<TripDto?> UpdateTripAsync(UpdateTripDto dto, int currentUserId);
        Task<bool> DeleteTripAsync(int id, int currentUserId, byte[] rowVersion);
        Task<TripAccessDto?> GetTripAccess(int id, int userId);
    }
}

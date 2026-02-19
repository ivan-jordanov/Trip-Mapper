using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface ITripRepositorySP : IGenericRepositorySP<Trip>
    {
        Task<Trip?> GetByTitleAsync(string title, int userId);
        Task<IEnumerable<Trip>> GetTripsForUserAsync(int userId, string? title, DateOnly? dateFrom, DateOnly? dateTo, int? page, int? pageSize);
        Task<int> GetTripsCountForUserAsync(int userId, string? title, DateOnly? dateFrom, DateOnly? dateTo);
        Task<Trip?> GetTripWithDetailsAsync(int id);
        Task<Trip?> GetTripWithAccessesAsync(int tripId);
        void Attach(Trip entity);
        void SetOriginalRowVersion(Trip entity, byte[] rowVersion);
        void ClearTracking();
    }
}
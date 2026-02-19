using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface ITripAccessRepositorySP
    {
        Task<TripAccess?> GetByIdAsync(int tripId, int userId);
        Task<IEnumerable<TripAccess>> GetAllAsync();
        Task<TripAccess> AddAsync(TripAccess entity);
        Task<TripAccess> UpdateAsync(TripAccess entity);
        Task<bool> DeleteAsync(int tripId, int userId);
        IQueryable<TripAccess> Query();
        
        Task<TripAccess?> GetAccessAsync(int tripId, int userId);
        Task<List<TripAccess>> GetByTripIdAsync(int tripId);
        void Delete(TripAccess entity);
    }
}
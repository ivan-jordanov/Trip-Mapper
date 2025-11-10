using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface ITripAccessRepository : IGenericRepository<TripAccess>
    {
        Task<TripAccess?> GetAccessAsync(int tripId, int userId);
        Task<List<TripAccess>> GetByTripIdAsync(int tripId);
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface IPhotoRepository : IGenericRepository<Photo> 
    {
        Task<List<Photo>> GetPhotosByPinIdsAsync(List<int> pinIds);
        Task<List<Photo>> GetPhotosByPinIdsOrTripIdAsync(List<int> pinIds, int tripId);
        Task<List<Photo>> GetPhotosByTripIdAsync(int tripId);
    }
}

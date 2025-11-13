using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperBL.DTOs;

namespace TripMapperBL.Interfaces
{
    public interface IPhotoService
    {
        // Create photo record in DB & set pinId or tripId
        Task<PhotoDto> CreatePhotoRecordForPinAsync(int pinId, string url, int currentUserId);
        Task<PhotoDto> CreatePhotoRecordForTripAsync(int tripId, string url, int currentUserId);

        // Go through list of pins, for each photo(s) attached to the pins n set their tripId
        Task<int> AddTripRecordForPinsAsync(int tripId, IEnumerable<string> pinTitles, int currentUserId);

        // Remove old photos w/ tripId that aren't in the new list of pinTitles
        Task<int> UpdateTripRecordForPinsAsync(int tripId, IEnumerable<string> pinTitles, int currentUserId);
        // Detach photos for tripId
        Task<int> DetachAllPhotosForTripAsync(int tripId, int currentUserId);

        // Delete photo record from DB
        Task<bool> DeletePhotoRecordAsync(int photoId, int currentUserId);
    }
}

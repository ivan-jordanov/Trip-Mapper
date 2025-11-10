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
        Task<PhotoDto> CreatePhotoRecordForPinAsync(int pinId, string url, int currentUserId);
        Task<PhotoDto> CreatePhotoRecordForTripAsync(int tripId, string url, int currentUserId);
        Task<bool> DeletePhotoRecordAsync(int photoId, int currentUserId);
    }
}

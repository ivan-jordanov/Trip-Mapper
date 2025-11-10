using Amazon.S3;
using Amazon.S3.Model;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Net;
using TripMapperBL.DTOs;
using TripMapperBL.Helpers;
using TripMapperBL.Interfaces;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperBL.Services
{
    public class PhotoService : IPhotoService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public PhotoService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<PhotoDto> CreatePhotoRecordForPinAsync(int pinId, string url, int currentUserId)
        {
            var pin = await _uow.Pins.GetByIdAsync(pinId);
            if (pin == null || pin.UserId != currentUserId)
                throw new UnauthorizedAccessException("You cannot add a photo to this pin.");

            var photo = new Photo
            {
                PinId = pinId,
                Url = url,
                UploadedAt = DateTime.UtcNow
            };

            await _uow.Photos.AddAsync(photo);
            await _uow.CompleteAsync();

            return _mapper.Map<PhotoDto>(photo);
        }

        public async Task<PhotoDto> CreatePhotoRecordForTripAsync(int tripId, string url, int currentUserId)
        {
            var trip = await _uow.Trips.Query()
                .Include(t => t.TripAccesses)
                .FirstOrDefaultAsync(t => t.Id == tripId);

            if (trip == null) throw new KeyNotFoundException();

            var owner = trip?.TripAccesses.Any(a => a.UserId == currentUserId && a.AccessLevel == "Owner") == true;
            if (!owner) throw new UnauthorizedAccessException("Only owner can add photos to this trip.");

            var photo = new Photo
            {
                TripId = tripId,
                Url = url,
                UploadedAt = DateTime.UtcNow
            };

            await _uow.Photos.AddAsync(photo);
            await _uow.CompleteAsync();

            return _mapper.Map<PhotoDto>(photo);
        }

        public async Task<bool> DeletePhotoRecordAsync(int photoId, int currentUserId)
        {
            var photo = await _uow.Photos.GetByIdAsync(photoId);
            if (photo == null) return false;

            if (photo.PinId.HasValue)
            {
                var pin = await _uow.Pins.GetByIdAsync((int)photo.PinId);
                if (pin == null || pin.UserId != currentUserId) return false;
            }
            else if (photo.TripId.HasValue)
            {
                var trip = await _uow.Trips.Query()
                    .Include(t => t.TripAccesses)
                    .FirstOrDefaultAsync(t => t.Id == photo.TripId);

                var owner = trip?.TripAccesses.Any(a => a.UserId == currentUserId && a.AccessLevel == "Owner") == true;
                if (!owner) return false;
            }
            else
            {
                return false;
            }

            _uow.Photos.Delete(photo);
            return await _uow.CompleteAsync();
        }
    }
}

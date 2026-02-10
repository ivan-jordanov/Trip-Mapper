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
            var trip = await _uow.Trips.GetTripWithAccessesAsync(tripId);

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

        // Set photo's trip.id for ALL of the photos associated with pinTitles
        public async Task<int> AddTripRecordForPinsAsync(int tripId, IEnumerable<string> pinTitles, int currentUserId)
        {
            if (pinTitles == null) return 0;
            var titles = pinTitles.Where(t => !string.IsNullOrWhiteSpace(t)).Distinct().ToList();
            if (titles.Count == 0) return 0;

            var trip = await _uow.Trips.GetTripWithAccessesAsync(tripId);

            if (trip == null) return 0;

            var owner = trip.TripAccesses.Any(a => a.UserId == currentUserId && a.AccessLevel == "Owner");
            if (!owner) throw new UnauthorizedAccessException();

            var pinIds = await _uow.Pins.GetPinIdsByTitlesAsync(currentUserId, titles);

            if (pinIds.Count == 0) return 0;

            var photos = await _uow.Photos.GetPhotosByPinIdsAsync(pinIds);

            foreach (var ph in photos)
            {
                ph.TripId = tripId;
                _uow.Photos.Update(ph);
            }

            await _uow.CompleteAsync();
            return photos.Count;
        }

        public async Task<int> UpdateTripRecordForPinsAsync(int tripId, IEnumerable<string> pinTitles, int currentUserId)
        {
            if (pinTitles == null) return 0;

            var titles = pinTitles
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (titles.Count == 0) return 0;

            // Load trip + check ownership
            var trip = await _uow.Trips.GetTripWithAccessesAsync(tripId);

            if (trip == null) return 0;

            if (!trip.TripAccesses.Any(a => a.UserId == currentUserId && a.AccessLevel == "Owner"))
                throw new UnauthorizedAccessException();

            // Get relevant pins
            var pinIds = await _uow.Pins.GetPinIdsByTitlesAsync(currentUserId, titles);

            // No matching pins
            if (pinIds.Count == 0) return 0;

            // Load ALL photos linked to these pins OR this trip
            var allPhotos = await _uow.Photos.GetPhotosByPinIdsOrTripIdAsync(pinIds, tripId);

            int updated = 0;

            foreach (var ph in allPhotos)
            {
                bool belongsToNewSet = ph.PinId != null && pinIds.Contains(ph.PinId.Value);

                if (belongsToNewSet)
                {
                    // Assign tripId if not assigned
                    if (ph.TripId != tripId)
                    {
                        ph.TripId = tripId;
                        updated++;
                    }
                }
                else
                {
                    // Photo no longer belongs to this trip → remove connection
                    if (ph.TripId != null)
                    {
                        ph.TripId = null;
                        updated++;
                    }
                }
            }

            await _uow.CompleteAsync();
            return updated;
        }



        public async Task<int> DetachAllPhotosForTripAsync(int tripId, int currentUserId)
        {
            var trip = await _uow.Trips.GetTripWithAccessesAsync(tripId);

            if (trip == null) return 0;

            var owner = trip.TripAccesses.Any(a => a.UserId == currentUserId && a.AccessLevel == "Owner");
            if (!owner) throw new UnauthorizedAccessException("Only owner can modify trip photos.");

            var photos = await _uow.Photos.GetPhotosByTripIdAsync(tripId);

            foreach (var ph in photos)
            {
                ph.TripId = null;
                // Delete photo record entirely if not bound to any trip/pin
                if(ph.TripId == null && ph.PinId == null)
                {
                    await this.DeletePhotoRecordAsync(ph.Id, currentUserId);
                }
                _uow.Photos.Update(ph);
            }

            await _uow.CompleteAsync();
            return photos.Count;
        }
        public async Task<bool> DeletePhotoRecordAsync(int photoId, int currentUserId)
        {
            var photo = await _uow.Photos.GetByIdAsync(photoId);
            if (photo == null) return false;

            // Authorization check
            if (photo.PinId.HasValue)
            {
                var pin = await _uow.Pins.GetByIdAsync((int)photo.PinId);
                if (pin == null || pin.UserId != currentUserId) return false;
            }
            else if (photo.TripId.HasValue)
            {
                var trip = await _uow.Trips.GetTripWithAccessesAsync((int)photo.TripId);

                var owner = trip?.TripAccesses.Any(a => a.UserId == currentUserId && a.AccessLevel == "Owner") == true;
                if (!owner) return false;
            }
            else
            {
                // Orphaned photo with no owner - should not be deleted without proper authorization
                return false;
            }

            _uow.Photos.Delete(photo);
            return await _uow.CompleteAsync();
        }
    }
}

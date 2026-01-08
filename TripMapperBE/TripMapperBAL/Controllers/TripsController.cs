using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using TripMapper.Controllers;
using TripMapperAPI.Extensions;
using TripMapperBL.DTOs;
using TripMapperBL.Interfaces;

namespace TripMapper.Controllers
{
    [Authorize]
    public class TripsController : BaseApiController
    {
        private readonly ITripService _tripService;
        private readonly IPhotoService _photoService;
        private readonly PhotoUploadService _photoUploadService;
        private const int MaxPhotosPerTrip = 5;

        public TripsController(ITripService tripService, IPhotoService photoService, PhotoUploadService photoUploadService)
        {
            _tripService = tripService;
            _photoService = photoService;
            _photoUploadService = photoUploadService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTrips(string? title, DateOnly? dateFrom, DateOnly? dateTo)
        {
            var userId = User.GetUserId();
            var trips = await _tripService.GetAllTripsAsync(userId, title, dateFrom, dateTo);
            return Ok(trips);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTrip(int id)
        {
            var userId = User.GetUserId();
            var trip = await _tripService.GetTripByIdAsync(id, userId);

            if (trip == null) return NotFound();

            return Ok(trip);
        }

        [HttpGet("{id}/access")]
        public async Task<IActionResult> GetTripAccess(int id)
        {
            var userId = User.GetUserId();
            var access = await _tripService.GetTripAccess(id, userId);
            if (access == null) return NotFound();

            return Ok(access);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTrip([FromForm] CreateTripDto dto, [FromForm] List<IFormFile>? photos)
        {
            var userId = User.GetUserId();
            var trip = await _tripService.CreateTripAsync(dto, userId);

            if (trip == null) return BadRequest("The trip title must be unique.");

            if (photos != null && photos.Count > MaxPhotosPerTrip)
            {
                return BadRequest($"A maximum of {MaxPhotosPerTrip} photos are allowed per trip.");
            }

            // Upload photo + set foreign key in photo DB
            if (photos != null && photos.Any())
            {
                foreach (var file in photos.Take(MaxPhotosPerTrip))
                {
                    await _photoUploadService.UploadForTripAsync(trip.Id, file, userId);
                }
            }

            if (dto.Pins != null)
            {
                // photoService to set tripId = trip.Id in the PHOTO(s) of the pins
                await _photoService.AddTripRecordForPinsAsync(trip.Id, dto.Pins, userId);
            }

            return CreatedAtAction(nameof(GetTrip), new { id = trip.Id }, trip);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTrip(int id, [FromForm] UpdateTripDto dto, [FromForm] List<IFormFile>? photos)
        {
            if (id != dto.Id)
                return BadRequest("ID mismatch.");

            var userId = User.GetUserId();

            var currentTrip = await _tripService.GetTripByIdAsync(id, userId);
            if (currentTrip == null) return NotFound();

            var currentPhotos = currentTrip.Photos?.ToList() ?? new List<PhotoDto>();
            var remainingPhotos = currentPhotos
                .Where(p => dto.PhotoIdsToDelete == null || !dto.PhotoIdsToDelete.Contains(p.Id))
                .ToList();

            var incomingPhotosCount = photos?.Count ?? 0;
            if (remainingPhotos.Count + incomingPhotosCount > MaxPhotosPerTrip)
            {
                return BadRequest($"You can only keep up to {MaxPhotosPerTrip} photos per trip.");
            }

            var updated = await _tripService.UpdateTripAsync(dto, userId);

            if (updated == null) return NotFound();

            // Handle photo deletions
            if (dto.PhotoIdsToDelete != null && dto.PhotoIdsToDelete.Any())
            {
                foreach (var pid in dto.PhotoIdsToDelete)
                {
                    var photoToDelete = currentPhotos.FirstOrDefault(p => p.Id == pid);
                    if (photoToDelete != null)
                    {
                        await _photoUploadService.DeleteAsync(photoToDelete.Id, photoToDelete.Url, userId);
                    }
                }
            }

            // Handle photo uploads
            if (photos != null && photos.Any())
            {
                foreach (var file in photos.Take(MaxPhotosPerTrip - remainingPhotos.Count))
                {
                    await _photoUploadService.UploadForTripAsync(id, file, userId);
                }
            }

            // Handle pin relationships
            if (dto.Pins != null && updated.Pins != null)
            {
                List<string> NewPinTitles = updated.Pins.Select(pin => pin.Title).Where(title => dto.Pins.Contains(title)).ToList();
                await _photoService.UpdateTripRecordForPinsAsync(id, NewPinTitles, userId);
            }

            // Fetch fresh trip data after all updates/uploads are complete
            var refreshed = await _tripService.GetTripByIdAsync(id, userId);

            return Ok(refreshed ?? updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrip(int id, [FromQuery] byte[] rowVersion)
        {
            var userId = User.GetUserId();

            // 1) Get all photos for this trip
            var trip = await _tripService.GetTripByIdAsync(id, userId);
            if (trip == null) return NotFound();

            var photosToDelete = trip.Photos?.ToList() ?? new List<PhotoDto>();

            // 2) Delete each photo from storage and database
            foreach (var photo in photosToDelete)
            {
                await _photoUploadService.DeleteAsync(photo.Id, photo.Url, userId);
            }

            // 3) Delete trip after photos are deleted to avoid FK conflicts
            var result = await _tripService.DeleteTripAsync(id, userId, rowVersion);

            if (!result) return NotFound();

            return NoContent();
        }
    }
}

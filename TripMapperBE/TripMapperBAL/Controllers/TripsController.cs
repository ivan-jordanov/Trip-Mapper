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
        public async Task<IActionResult> GetTrips(string? title, DateOnly? dateFrom, DateOnly? dateTo, int? page, int? pageSize)
        {
            var userId = User.GetUserId();
            var trips = await _tripService.GetTripsAsync(userId, title, dateFrom, dateTo, page, pageSize);
            return Ok(trips);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetTripsCount(string? title, DateOnly? dateFrom, DateOnly? dateTo)
        {
            var userId = User.GetUserId();
            var count = await _tripService.GetTripsCountAsync(userId, title, dateFrom, dateTo);
            return Ok(new { count });
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
            TripDto? trip;
            try
            {
                trip = await _tripService.CreateTripAsync(dto, userId);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }

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

            TripDto? updated;
            try
            {
                updated = await _tripService.UpdateTripAsync(dto, userId);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }

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
            if (dto.Pins != null)
            {
                await _photoService.UpdateTripRecordForPinsAsync(id, dto.Pins, userId);
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
            var tripOnlyPhotos = photosToDelete.Where(p => p.PinId == null).ToList();
            var pinLinkedPhotos = photosToDelete.Where(p => p.PinId != null).ToList();

            // 2) Delete only trip-only photos from storage and database
            foreach (var photo in tripOnlyPhotos)
            {
                await _photoUploadService.DeleteAsync(photo.Id, photo.Url, userId);
            }

            // 3) Keep pin photos, just detach them from this trip
            if (pinLinkedPhotos.Any())
            {
                await _photoService.DetachAllPhotosForTripAsync(id, userId);
            }

            // 4) Delete trip after photo cleanup to avoid FK conflicts
            var result = await _tripService.DeleteTripAsync(id, userId, rowVersion);

            if (!result) return NotFound();

            return NoContent();
        }
    }
}

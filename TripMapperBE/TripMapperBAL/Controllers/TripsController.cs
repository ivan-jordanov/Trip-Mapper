using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Net.NetworkInformation;
using TripMapper.Controllers;
using TripMapperAPI.Extensions;
using TripMapperBL.DTOs;
using TripMapperBL.Interfaces;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapper.Controllers
{
    public class TripsController : ControllerBase
    {
        private readonly ITripService _tripService;
        private readonly IPhotoService _photoService;
        private readonly PhotoUploadService _photoUploadService;

        public TripsController(ITripService tripService, IPhotoService photoService, PhotoUploadService photoUploadService)
        {
            _tripService = tripService;
            _photoService = photoService;
            _photoUploadService = photoUploadService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTrips()
        {
            var userId = User.GetUserId();
            var trips = await _tripService.GetAllTripsAsync(userId);
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

        [HttpPost]
        public async Task<IActionResult> CreateTrip([FromForm] CreateTripDto dto, IFormFile? photo)
        {
            var userId = User.GetUserId();
            var trip = await _tripService.CreateTripAsync(dto, userId);

            if (trip == null) return BadRequest("The trip title must be unique.");

            // Upload photo + set foreign key in photo DB
            if (photo != null)
            {
                await _photoUploadService.UploadForTripAsync(trip.Id, photo, userId);
            }

            if (dto.Pins != null)
            {
                // photoService to set tripId = trip.Id in the PHOTO(s) of the pins
                await _photoService.AddTripRecordForPinsAsync(trip.Id, dto.Pins, userId);
            }

            return CreatedAtAction(nameof(GetTrip), new { id = trip.Id }, trip);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTrip(int id, [FromForm] UpdateTripDto dto, IFormFile? photo)
        {
            if (id != dto.Id)
                return BadRequest("ID mismatch.");

            var userId = User.GetUserId();
            var updated = await _tripService.UpdateTripAsync(dto, userId);

            if (updated == null) return NotFound();

            // Upload photo + set foreign key in photo DB
            // Currently, there is no backend logic to check if a photo already exists for trip(can handle in frontend for now),
            // however i need to decide whether to limit 1 photo per trip or multiple for trip/pin
            if (photo != null)
            {
                await _photoUploadService.UploadForTripAsync(id, photo, userId);
            }


            if (dto.Pins != null && updated.Pins != null)
            {
                List<string> NewPinTitles = updated.Pins.Select(pin => pin.Title).Where(title => dto.Pins.Contains(title)).ToList();
                await _photoService.UpdateTripRecordForPinsAsync(id, NewPinTitles, userId);
            }

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrip(int id, [FromBody] byte[] rowVersion)
        {
            var userId = User.GetUserId();

            // 1) detach photos first
            await _photoService.DetachAllPhotosForTripAsync(id, userId);

            // 2) delete trip after photo detach to avoid FK conflicts
            var result = await _tripService.DeleteTripAsync(id, userId, rowVersion);

            if (!result) return NotFound();

            return NoContent();
        }
    }
}

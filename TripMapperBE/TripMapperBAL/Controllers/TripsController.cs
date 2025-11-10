using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        private readonly PhotoUploadService _photoUploadService;

        public TripsController(ITripService tripService, PhotoUploadService photoUploadService)
        {
            _tripService = tripService;
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

            if (photo != null)
            {
                await _photoUploadService.UploadForTripAsync(trip.Id, photo, userId);
            }

            return CreatedAtAction(nameof(GetTrip), new { id = trip.Id }, trip);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTrip(int id, [FromForm] UpdateTripDto dto, IFormFile? photo)
        {
            // todo: the front end should also pass a List of pins (or at least their IDs, names, or something) that i want to bind to the trip
            // which means i should set the pins' trip foreign keys to this current trip.
            if (id != dto.Id)
                return BadRequest("ID mismatch.");

            var userId = User.GetUserId();
            var updated = await _tripService.UpdateTripAsync(dto, userId);

            if (updated == null) return NotFound();

            if (photo != null)
            {
                await _photoUploadService.UploadForTripAsync(id, photo, userId);
            }

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrip(int id, [FromBody] byte[] rowVersion)
        {
            var userId = User.GetUserId();
            var result = await _tripService.DeleteTripAsync(id, userId, rowVersion);

            if (!result) return NotFound();

            return NoContent();
        }
    }
}

using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using TripMapper.Controllers;
using TripMapperAPI.Extensions;
using TripMapperBL.DTOs;
using TripMapperBL.Interfaces;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapper.Controllers
{
    public class PinsController : BaseApiController
    {
        private readonly IPinService _pinService;
        private readonly PhotoUploadService _photoUploadService;

        public PinsController(IPinService pinService, PhotoUploadService photoUploadService)
        {
            _pinService = pinService;
            _photoUploadService = photoUploadService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPins()
        {
            var userId = User.GetUserId();
            var pins = await _pinService.GetAllPinsAsync(userId);
            return Ok(pins);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPin(int id)
        {
            var userId = User.GetUserId();
            var pin = await _pinService.GetPinByIdAsync(id, userId);
            if (pin == null) return NotFound();
            return Ok(pin);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePin([FromForm] CreatePinDto dto, [FromForm] double latitude, [FromForm] double longitude, IFormFile? photo)
        {
            var userId = User.GetUserId();

            var pin = await _pinService.CreatePinAsync(dto, userId, latitude, longitude);

            if (photo != null)
            {
                // upload to backblaze + create DB record
                await _photoUploadService.UploadForPinAsync(pin.Id, photo, userId);
            }

            return CreatedAtAction(nameof(GetPin), new { id = pin.Id }, pin);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePin(int id)
        {
            var userId = User.GetUserId();
            var success = await _pinService.DeletePinAsync(id, userId);
            if (!success) return BadRequest("Failed to delete pin");
            return NoContent();
        }
    }
}

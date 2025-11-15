using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.NetworkInformation;
using System.Text;
using System.Threading.Tasks;
using TripMapperBL.DTOs;
using TripMapperBL.Interfaces;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperBL.Services
{
    public class TripService : ITripService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public TripService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TripDto>> GetAllTripsAsync(int currentUserId, string? title, DateOnly? dateFrom)
        {
            var trips = await _uow.Trips.GetTripsForUserAsync(currentUserId, title, dateFrom);
            return _mapper.Map<IEnumerable<TripDto>>(trips);
        }

        public async Task<TripDto?> GetTripByIdAsync(int id, int currentUserId)
        {
            var access = await _uow.TripAccess.GetAccessAsync(id, currentUserId);
            if (access == null) throw new UnauthorizedAccessException("You do not have access to this trip.");

            var trip = await _uow.Trips.GetTripWithDetailsAsync(id);
            if (trip == null) return null;

            return _mapper.Map<TripDto>(trip);
        }

        public async Task<TripDto?> CreateTripAsync(CreateTripDto dto, int currentUserId)
        {
            var trip = await _uow.Trips.GetByTitleAsync(dto.Title, currentUserId);
            if (trip != null)
            {
                return null;
            }
            trip = _mapper.Map<Trip>(dto);


            await _uow.Trips.AddAsync(trip);
            await _uow.CompleteAsync();

            // Form relationship pins - trip

            // Normalize strings
            var targetTitles = dto.Pins?
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim().ToLower())
                .Distinct()
                .ToList() ?? new List<string>();

            // Load all pins belonging to this user whose titles match & are not already assigned to another trip
            var candidatePins = await _uow.Pins.GetPinsForTripUpdateAsync(currentUserId, trip.Id, targetTitles);


            for (int i = 0; i < candidatePins.Count; i++)
            {
                var pin = candidatePins[i];

                // Even though trip initially doesnt have the id yet, EF tracks the object I passed in & populates the id after completeAsync
                pin.TripId = trip.Id;
                _uow.Pins.Update(pin);
            }


            // Assign current user as owner
            var owner = new TripAccess
            {
                TripId = trip.Id,
                UserId = currentUserId,
                AccessLevel = "Owner"
            };

            await _uow.TripAccess.AddAsync(owner);

            // According to the data given from the frontend, give trip view access to the following users

            if (dto.SharedUsernames != null && dto.SharedUsernames.Any())
            {
                foreach (var username in dto.SharedUsernames)
                {
                    var user = await _uow.Users.GetByUsernameAsync(username);
                    if (user == null || user.Id == currentUserId) continue;

                    await _uow.TripAccess.AddAsync(new TripAccess
                    {
                        TripId = trip.Id,
                        UserId = user.Id,
                        AccessLevel = "View"
                    });
                }
            }

            await _uow.CompleteAsync();

            return _mapper.Map<TripDto>(trip);
        }

        public async Task<TripDto?> UpdateTripAsync(UpdateTripDto dto, int currentUserId)
        {
            _uow.Trips.ClearTracking();

            var access = await _uow.TripAccess.GetAccessAsync(dto.Id, currentUserId);
            if (access == null || access.AccessLevel != "Owner")
                throw new UnauthorizedAccessException("Only owner can update trip.");

            var trip = await _uow.Trips.GetByIdAsync(dto.Id);
            if (trip == null) return null;

            // Correct trip - pins relationships

            // Normalize titles to lowercase
            var targetTitles = dto.Pins?
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim().ToLower())
                .Distinct()
                .ToList() ?? new List<string>();

            // Load pins relevant to update
            var pins = await _uow.Pins.GetPinsForTripUpdateAsync(currentUserId, trip.Id, targetTitles);

            // Attach or detach relationship pin - trip relationship
            foreach (var pin in pins)
            {
                bool shouldBeInTrip = targetTitles.Contains(pin.Title.ToLower());

                if (shouldBeInTrip && pin.TripId != trip.Id)
                {
                    pin.TripId = trip.Id;
                    _uow.Pins.Update(pin);
                }
                else if (!shouldBeInTrip && pin.TripId == trip.Id)
                {
                    pin.TripId = null;
                    _uow.Pins.Update(pin);
                }
            }



            if (!string.IsNullOrEmpty(dto.Title)) trip.Title = dto.Title;
            if (!string.IsNullOrEmpty(dto.Description)) trip.Description = dto.Description;
            if (dto.DateVisited.HasValue) trip.DateVisited = dto.DateVisited;
            if (dto.DateFrom.HasValue) trip.DateFrom = dto.DateFrom;

            // Revoke trip accesses & replace with modified list of users(who should have view access)
            // (check actually if this is proper logic)

            var existing = await _uow.TripAccess.GetByTripIdAsync(dto.Id);
            foreach (var a in existing.Where(x => x.UserId != currentUserId))
                _uow.TripAccess.Delete(a);

            if (dto.SharedUsernames != null && dto.SharedUsernames.Any())
            {
                foreach (var username in dto.SharedUsernames)
                {
                    var user = await _uow.Users.GetByUsernameAsync(username);
                    if (user == null || user.Id == currentUserId) continue;

                    await _uow.TripAccess.AddAsync(new TripAccess
                    {
                        TripId = trip.Id,
                        UserId = user.Id,
                        AccessLevel = "View"
                    });
                }
            }

            try
            {
                // No need to use _uow.Trips.Attach because EF does it automatically after using .Attach
                _uow.Trips.Attach(trip);
                _uow.Trips.SetOriginalRowVersion(trip, dto.RowVersion);

                await _uow.CompleteAsync();

            }
            catch (DbUpdateConcurrencyException)
            {
                _uow.ClearTracking();
                throw new DbUpdateConcurrencyException("This trip was modified by another user. Please refresh and try again.");
            }

            return _mapper.Map<TripDto>(trip);
        }

        public async Task<bool> DeleteTripAsync(int id, int currentUserId, byte[] rowVersion)
        {
            _uow.Trips.ClearTracking();

            var access = await _uow.TripAccess.GetAccessAsync(id, currentUserId);
            if (access == null || access.AccessLevel != "Owner")
                throw new UnauthorizedAccessException("Only owner can delete the trip.");

            var trip = await _uow.Trips.GetByIdAsync(id);
            if (trip == null) return false;


            try
            {
                _uow.Trips.Attach(trip);
                _uow.Trips.SetOriginalRowVersion(trip, rowVersion);
                _uow.Trips.Delete(id);

                await _uow.CompleteAsync();

            }
            catch (DbUpdateConcurrencyException)
            {
                _uow.ClearTracking();
                throw new DbUpdateConcurrencyException("This trip was modified by another user. Please refresh and try again.");
            }

            return true;
        }
    }


}

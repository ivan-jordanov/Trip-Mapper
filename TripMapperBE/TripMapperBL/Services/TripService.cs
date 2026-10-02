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

        public async Task<IEnumerable<TripDto>> GetTripsAsync(int currentUserId, string? title, DateOnly? dateFrom, DateOnly? dateTo, int? page, int? pageSize)
        {
            var trips = await _uow.Trips.GetTripsForUserAsync(currentUserId, title, dateFrom, dateTo, page, pageSize);
            return _mapper.Map<IEnumerable<TripDto>>(trips);
        }

        public async Task<int> GetTripsCountAsync(int currentUserId, string? title, DateOnly? dateFrom, DateOnly? dateTo)
        {
            var count = await _uow.Trips.GetTripsCountForUserAsync(currentUserId, title, dateFrom, dateTo);
            return count;
        }

        public async Task<TripDto?> GetTripByIdAsync(int id, int currentUserId)
        {
            var access = await _uow.TripAccess.GetAccessAsync(id, currentUserId);
            if (access == null) throw new UnauthorizedAccessException("You do not have access to this trip.");

            var trip = await _uow.Trips.GetTripWithDetailsAsync(id);
            if (trip == null) return null;

            return _mapper.Map<TripDto>(trip);
        }

        public async Task<TripAccessDto?> GetTripAccess(int id, int currentUserId)
        {
            var access = await _uow.TripAccess.GetAccessAsync(id, currentUserId);
            if (access == null) return null;

            return _mapper.Map<TripAccessDto>(access);
        }

        public async Task<IEnumerable<TripAccessDto>> GetCollaboratorsAsync(int tripId, int currentUserId)
        {
            var access = await _uow.TripAccess.GetAccessAsync(tripId, currentUserId);
            if (access == null) throw new UnauthorizedAccessException("You do not have access to this trip.");

            var collaborators = await _uow.TripAccess.GetByTripIdAsync(tripId);
            return _mapper.Map<IEnumerable<TripAccessDto>>(collaborators);
        }

        public async Task<TripAccessDto> GrantAccessAsync(int tripId, int ownerUserId, string username, string accessLevel)
        {
            var ownerAccess = await _uow.TripAccess.GetAccessAsync(tripId, ownerUserId);
            if (ownerAccess == null || ownerAccess.AccessLevel != "Owner")
                throw new UnauthorizedAccessException("Only owner can manage trip access.");

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(accessLevel))
                throw new ArgumentException("Username and access level are required.");

            if (!string.Equals(accessLevel, "View", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(accessLevel, "Editor", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Access level must be View or Editor.");

            var user = await _uow.Users.GetByUsernameAsync(username.Trim());
            if (user == null) throw new KeyNotFoundException("User not found.");
            if (user.Id == ownerUserId) throw new ArgumentException("The owner already has access to this trip.");

            var existing = await _uow.TripAccess.GetAccessAsync(tripId, user.Id);
            if (existing != null) throw new ArgumentException("This user already has access to the trip.");

            var tripAccess = new TripAccess
            {
                TripId = tripId,
                UserId = user.Id,
                AccessLevel = accessLevel.Equals("Editor", StringComparison.OrdinalIgnoreCase)
                    ? "Editor"
                    : "View"
            };

            await _uow.TripAccess.AddAsync(tripAccess);
            await _uow.CompleteAsync();

            tripAccess.User = user;
            return _mapper.Map<TripAccessDto>(tripAccess);
        }

        public async Task<bool> RevokeAccessAsync(int tripId, int ownerUserId, int targetUserId)
        {
            var ownerAccess = await _uow.TripAccess.GetAccessAsync(tripId, ownerUserId);
            if (ownerAccess == null || ownerAccess.AccessLevel != "Owner")
                throw new UnauthorizedAccessException("Only owner can manage trip access.");

            if (targetUserId == ownerUserId)
                throw new ArgumentException("The owner cannot be removed from the trip.");

            var targetAccess = await _uow.TripAccess.GetAccessAsync(tripId, targetUserId);
            if (targetAccess == null) return false;

            return await _uow.TripAccess.DeleteAsync(tripId, targetUserId)
                && await _uow.CompleteAsync();
        }

        public async Task<bool> LeaveTripAsync(int tripId, int userId)
        {
            var access = await _uow.TripAccess.GetAccessAsync(tripId, userId);
            if (access == null) return false;
            if (access.AccessLevel == "Owner")
                throw new ArgumentException("The owner cannot leave the trip.");

            return await _uow.TripAccess.DeleteAsync(tripId, userId)
                && await _uow.CompleteAsync();
        }

        public async Task<TripDto?> CreateTripAsync(CreateTripDto dto, int currentUserId)
        {
            var trip = await _uow.Trips.GetByTitleAsync(dto.Title, currentUserId);
            if (trip != null)
            {
                return null;
            }

            await ValidatePinsAvailableForTripAsync(dto.Pins, currentUserId, null);

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
            if (access == null || (access.AccessLevel != "Owner" && access.AccessLevel != "Editor"))
                throw new UnauthorizedAccessException("Only owner or editor can update trip.");

            var trip = await _uow.Trips.GetByIdAsync(dto.Id);
            if (trip == null) return null;

            await ValidatePinsAvailableForTripAsync(dto.Pins, currentUserId, dto.Id);

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
                bool shouldBeInTrip = targetTitles.Contains(pin.Title?.ToLower() ?? string.Empty);

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

            // Only owners can change collaborator access during a full trip save.
            if (access.AccessLevel == "Owner")
            {
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

        private async Task ValidatePinsAvailableForTripAsync(IEnumerable<string>? pinTitles, int currentUserId, int? currentTripId)
        {
            if (pinTitles == null) return;

            var uniqueTitles = pinTitles
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(t => t.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            foreach (var title in uniqueTitles)
            {
                var pin = await _uow.Pins.GetByTitleAsync(title, currentUserId);
                if (pin == null) continue;

                if (pin.TripId.HasValue && pin.TripId.Value != currentTripId)
                {
                    throw new ArgumentException($"Pin '{title}' is already assigned to another trip.");
                }
            }
        }

        public async Task<bool> DeleteTripAsync(int id, int currentUserId, byte[] rowVersion)
        {
            _uow.Trips.ClearTracking();

            var access = await _uow.TripAccess.GetAccessAsync(id, currentUserId);
            if (access == null || access.AccessLevel != "Owner")
                throw new UnauthorizedAccessException("Only owner can delete the trip.");

            var trip = await _uow.Trips.GetByIdAsync(id);
            if (trip == null) return false;

            // Detach all pins from this trip before deleting
            var pinsInTrip = await _uow.Pins.GetPinsForTripUpdateAsync(currentUserId, id, new List<string>());
            foreach (var pin in pinsInTrip.Where(p => p.TripId == id))
            {
                pin.TripId = null;
                _uow.Pins.Update(pin);
            }

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

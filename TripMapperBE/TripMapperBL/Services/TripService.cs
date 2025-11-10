using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<IEnumerable<TripDto>> GetAllTripsAsync(int currentUserId)
        {
            var trips = await _uow.Trips.GetTripsForUserAsync(currentUserId);
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

        public async Task<TripDto> CreateTripAsync(CreateTripDto dto, int currentUserId)
        {
            var trip = _mapper.Map<Trip>(dto);

            // TODO: Complete trip here, add logic for photos & pins, update DTOs

            await _uow.Trips.AddAsync(trip);
            await _uow.CompleteAsync();

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

            // TODO: Complete trip here, add logic for pins, update DTOs

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

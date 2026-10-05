using AutoMapper;
using TripMapperBL.DTOs;
using TripMapperBL.Interfaces;
using TripMapperDAL.Interfaces;
using TripMapperDB;
using TripMapperDB.Models;

namespace TripMapperBL.Services
{
    public class FriendService : IFriendService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public FriendService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<FriendRequestDto> SendRequestAsync(int requesterId, string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new ArgumentException("Username is required.");

            var addressee = await _uow.Users.GetByUsernameAsync(username.Trim());
            if (addressee == null)
                throw new KeyNotFoundException("User not found.");

            if (addressee.Id == requesterId)
                throw new ArgumentException("You cannot send a friend request to yourself.");

            var relationship = await _uow.Friends.GetRelationshipAsync(requesterId, addressee.Id);
            if (relationship?.Status == FriendRequestStatus.Pending)
                throw new ArgumentException("A friend request already exists.");
            if (relationship?.Status == FriendRequestStatus.Accepted)
                throw new ArgumentException("You are already friends with this user.");

            FriendRequest request;
            if (relationship != null)
            {
                request = relationship;
                request.RequesterId = requesterId;
                request.AddresseeId = addressee.Id;
                request.Status = FriendRequestStatus.Pending;
                request.CreatedAt = DateTime.UtcNow;
                request.RespondedAt = null;
                _uow.Friends.Update(request);
            }
            else
            {
                request = new FriendRequest
                {
                    RequesterId = requesterId,
                    AddresseeId = addressee.Id,
                    Status = FriendRequestStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };
                await _uow.Friends.AddAsync(request);
            }

            await _uow.CompleteAsync();
            var saved = await _uow.Friends.GetRelationshipAsync(requesterId, addressee.Id);
            return _mapper.Map<FriendRequestDto>(saved ?? request);
        }

        public async Task<FriendRequestDto?> RespondToRequestAsync(int userId, int requestId, bool accept)
        {
            var request = await _uow.Friends.GetByIdAsync(requestId);
            if (request == null || request.AddresseeId != userId || request.Status != FriendRequestStatus.Pending)
                return null;

            request.Status = accept ? FriendRequestStatus.Accepted : FriendRequestStatus.Declined;
            request.RespondedAt = DateTime.UtcNow;
            _uow.Friends.Update(request);
            await _uow.CompleteAsync();

            var updated = await _uow.Friends.GetRelationshipAsync(request.RequesterId, request.AddresseeId);
            return _mapper.Map<FriendRequestDto>(updated ?? request);
        }

        public async Task<IEnumerable<FriendRequestDto>> GetRequestsAsync(int userId, bool incoming)
        {
            var requests = await _uow.Friends.GetPendingRequestsByUserAsync(userId, incoming);
            return _mapper.Map<IEnumerable<FriendRequestDto>>(requests);
        }

        public async Task<IEnumerable<FriendDto>> GetFriendsAsync(int userId)
        {
            var relationships = await _uow.Friends.GetAcceptedFriendsAsync(userId);
            return relationships.Select(request =>
            {
                var friend = request.RequesterId == userId ? request.Addressee : request.Requester;
                return new FriendDto
                {
                    UserId = friend.Id,
                    Username = friend.Username,
                    KnownAs = friend.KnownAs,
                    FriendsSince = request.RespondedAt ?? request.CreatedAt
                };
            });
        }

        public async Task<bool> RemoveFriendAsync(int userId, int friendUserId)
        {
            if (userId == friendUserId)
                return false;

            var relationship = await _uow.Friends.GetRelationshipAsync(userId, friendUserId);
            if (relationship?.Status != FriendRequestStatus.Accepted)
                return false;

            _uow.Friends.Delete(relationship);
            await _uow.CompleteAsync();
            return true;
        }
    }
}

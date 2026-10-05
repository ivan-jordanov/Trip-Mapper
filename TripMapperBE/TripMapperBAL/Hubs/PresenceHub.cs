using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using TripMapper.Services;
using TripMapperAPI.Extensions;
using TripMapperDAL.Interfaces;

namespace TripMapper.Hubs
{
    [Authorize]
    public class PresenceHub : Hub
    {
        private readonly PresenceTracker _tracker;
        private readonly ITripAccessRepository _tripAccessRepository;

        public PresenceHub(PresenceTracker tracker, ITripAccessRepository tripAccessRepository)
        {
            _tracker = tracker;
            _tripAccessRepository = tripAccessRepository;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User!.GetUserId();
            var becameOnline = _tracker.UserConnected(userId, Context.ConnectionId);

            if (becameOnline)
            {
                // Presence is visible only to users who share a trip with this user.
                var collaboratorIds = await _tripAccessRepository.GetCollaboratorUserIdsAsync(userId);
                await Clients.Users(collaboratorIds.Select(id => id.ToString())).SendAsync("UserIsOnline", userId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User!.GetUserId();
            var becameOffline = _tracker.UserDisconnected(userId, Context.ConnectionId);

            if (becameOffline)
            {
                var collaboratorIds = await _tripAccessRepository.GetCollaboratorUserIdsAsync(userId);
                await Clients.Users(collaboratorIds.Select(id => id.ToString())).SendAsync("UserIsOffline", userId);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
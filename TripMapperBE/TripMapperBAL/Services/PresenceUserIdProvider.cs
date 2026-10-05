using Microsoft.AspNetCore.SignalR;

namespace TripMapper.Services
{
    public class PresenceUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
            => connection.User?.FindFirst("UserId")?.Value;
    }
}
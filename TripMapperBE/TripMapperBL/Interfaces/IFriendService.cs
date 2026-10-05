using TripMapperBL.DTOs;

namespace TripMapperBL.Interfaces
{
    public interface IFriendService
    {
        Task<FriendRequestDto> SendRequestAsync(int requesterId, string username);
        Task<FriendRequestDto?> RespondToRequestAsync(int userId, int requestId, bool accept);
        Task<IEnumerable<FriendRequestDto>> GetRequestsAsync(int userId, bool incoming);
        Task<IEnumerable<FriendDto>> GetFriendsAsync(int userId);
        Task<bool> RemoveFriendAsync(int userId, int friendUserId);
    }
}

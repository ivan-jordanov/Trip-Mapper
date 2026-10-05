using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface IFriendRepository : IGenericRepository<FriendRequest>
    {
        Task<List<FriendRequest>> GetPendingRequestsByUserAsync(int userId, bool incoming);
        Task<FriendRequest?> GetRelationshipAsync(int firstUserId, int secondUserId);
        Task<List<FriendRequest>> GetAcceptedFriendsAsync(int userId);
    }
}

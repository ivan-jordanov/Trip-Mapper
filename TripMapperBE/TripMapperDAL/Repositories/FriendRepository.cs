using Microsoft.EntityFrameworkCore;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperDAL.Repositories
{
    public class FriendRepository : GenericRepository<FriendRequest>, IFriendRepository
    {
        public FriendRepository(TripMapperContext context) : base(context) { }

        public async Task<List<FriendRequest>> GetPendingRequestsByUserAsync(int userId, bool incoming)
        {
            var query = _context.FriendRequests
                .Include(request => request.Requester)
                .Include(request => request.Addressee)
                .Where(request => request.Status == FriendRequestStatus.Pending);

            return await (incoming
                ? query.Where(request => request.AddresseeId == userId)
                : query.Where(request => request.RequesterId == userId))
                .OrderByDescending(request => request.CreatedAt)
                .ToListAsync();
        }

        public async Task<FriendRequest?> GetRelationshipAsync(int firstUserId, int secondUserId)
        {
            return await _context.FriendRequests
                .Include(request => request.Requester)
                .Include(request => request.Addressee)
                .Where(request =>
                    (request.RequesterId == firstUserId && request.AddresseeId == secondUserId)
                    || (request.RequesterId == secondUserId && request.AddresseeId == firstUserId))
                .OrderByDescending(request => request.Status == FriendRequestStatus.Pending)
                .ThenByDescending(request => request.Status == FriendRequestStatus.Accepted)
                .ThenByDescending(request => request.Id)
                .FirstOrDefaultAsync();
        }

        public async Task<List<FriendRequest>> GetAcceptedFriendsAsync(int userId)
        {
            return await _context.FriendRequests
                .Include(request => request.Requester)
                .Include(request => request.Addressee)
                .Where(request => request.Status == FriendRequestStatus.Accepted
                    && (request.RequesterId == userId || request.AddresseeId == userId))
                .OrderByDescending(request => request.RespondedAt ?? request.CreatedAt)
                .ToListAsync();
        }
    }
}

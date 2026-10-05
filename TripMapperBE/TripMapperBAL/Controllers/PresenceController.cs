using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripMapper.Controllers;
using TripMapper.Services;
using TripMapperAPI.Extensions;
using TripMapperDAL.Interfaces;

namespace TripMapper.Controllers
{
    [Authorize]
    public class PresenceController : BaseApiController
    {
        private readonly ITripAccessRepository _tripAccessRepository;
        private readonly PresenceTracker _tracker;

        public PresenceController(ITripAccessRepository tripAccessRepository, PresenceTracker tracker)
        {
            _tripAccessRepository = tripAccessRepository;
            _tracker = tracker;
        }

        [HttpGet("online")]
        public async Task<IActionResult> GetOnlineUsers()
        {
            var userId = User.GetUserId();
            var collaboratorIds = await _tripAccessRepository.GetCollaboratorUserIdsAsync(userId);
            return Ok(new { userIds = _tracker.GetOnlineUserIds(collaboratorIds) });
        }
    }
}
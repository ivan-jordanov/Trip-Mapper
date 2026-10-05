using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripMapper.Controllers;
using TripMapperAPI.Extensions;
using TripMapperBL.DTOs;
using TripMapperBL.Interfaces;

namespace TripMapper.Controllers
{
    [Authorize]
    public class FriendsController : BaseApiController
    {
        private readonly IFriendService _friendService;

        public FriendsController(IFriendService friendService)
        {
            _friendService = friendService;
        }

        [HttpPost("requests")]
        public async Task<IActionResult> SendRequest([FromBody] AddFriendDto dto)
        {
            try
            {
                return Ok(await _friendService.SendRequestAsync(User.GetUserId(), dto.Username));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("requests")]
        public async Task<IActionResult> GetRequests([FromQuery] string direction = "incoming")
        {
            if (!string.Equals(direction, "incoming", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(direction, "outgoing", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Direction must be incoming or outgoing." });

            var incoming = string.Equals(direction, "incoming", StringComparison.OrdinalIgnoreCase);
            return Ok(await _friendService.GetRequestsAsync(User.GetUserId(), incoming));
        }

        [HttpPost("requests/{id:int}/accept")]
        public async Task<IActionResult> AcceptRequest(int id)
            => await Respond(id, true);

        [HttpPost("requests/{id:int}/decline")]
        public async Task<IActionResult> DeclineRequest(int id)
            => await Respond(id, false);

        [HttpGet]
        public async Task<IActionResult> GetFriends()
            => Ok(await _friendService.GetFriendsAsync(User.GetUserId()));

        [HttpDelete("{userId:int}")]
        public async Task<IActionResult> RemoveFriend(int userId)
            => (await _friendService.RemoveFriendAsync(User.GetUserId(), userId)) ? NoContent() : NotFound();

        private async Task<IActionResult> Respond(int requestId, bool accept)
        {
            var request = await _friendService.RespondToRequestAsync(User.GetUserId(), requestId, accept);
            return request == null ? NotFound() : Ok(request);
        }
    }

    public class AddFriendDto
    {
        public string Username { get; set; } = string.Empty;
    }
}

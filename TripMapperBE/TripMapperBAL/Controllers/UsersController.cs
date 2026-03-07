using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripMapper.Controllers;
using TripMapper.Services;
using TripMapperAPI.Extensions;
using TripMapperBL.DTOs;
using TripMapperBL.Interfaces;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapper.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
            => Ok(await _userService.GetAllUsersAsync());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            return user == null ? NotFound() : Ok(user);
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userId = User.GetUserId();
            var me = await _userService.GetUserByIdAsync(userId);
            return me == null ? NotFound() : Ok(me);
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe(UpdateAccountDto dto)
        {
            var userId = User.GetUserId();
            var updated = await _userService.UpdateAccountAsync(userId, dto);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpPost("me/password")]
        public async Task<IActionResult> ChangePassword(UpdatePasswordDto dto)
        {
            var userId = User.GetUserId();
            var success = await _userService.UpdateUserPasswordAsync(userId, dto.CurrentPassword, dto.NewPassword);
            
            if (!success)
                return BadRequest("Current password is incorrect.");

            return Ok(new { message = "Password changed successfully." });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var ok = await _userService.DeleteUserAsync(id);
            return ok ? NoContent() : NotFound();
        }
    }
}

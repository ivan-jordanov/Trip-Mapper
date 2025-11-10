using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperBL.DTOs;
using TripMapperDB.Models;

namespace TripMapperBL.Interfaces
{
    public interface IUserService
    {
        Task<User?> RegisterAsync(RegisterDto dto);
        Task<User?> AuthenticateAsync(string username, string password);
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<bool> DeleteUserAsync(int id);
        Task<UserDto?> MapToUserDtoAsync(int id);
    }
}

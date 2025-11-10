using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using TripMapperBL.DTOs;
using TripMapperBL.Interfaces;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperBL.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public UserService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<User?> RegisterAsync(RegisterDto dto)
        {
            if (await _uow.Users.ExistsAsync(dto.Username))
                return null;

            using var hmac = new HMACSHA512();

            var user = new User
            {
                Username = dto.Username.ToLower(),
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
                PasswordSalt = hmac.Key
            };

            _uow.Users.Add(user);
            await _uow.CompleteAsync();
            return user;
        }

        public async Task<User?> AuthenticateAsync(string username, string password)
        {
            var user = await _uow.Users.GetByUsernameAsync(username);
            if (user == null) return null;

            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

            if (!computedHash.SequenceEqual(user.PasswordHash))
                return null;

            return user;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _uow.Users.GetAllAsync();
            return _mapper.Map<IEnumerable<UserDto>>(users);
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _uow.Users.GetByIdAsync(id);
            return user == null ? null : _mapper.Map<UserDto>(user);
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            _uow.Users.Delete(id);
            return await _uow.CompleteAsync();
        }

        public async Task<UserDto?> MapToUserDtoAsync(int id)
        {
            var user = await _uow.Users.GetByIdAsync(id);
            return user == null ? null : _mapper.Map<UserDto>(user);
        }
    }

}

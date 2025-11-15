using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperDAL.Repositories
{
    public class UserRepositorySp : GenericRepository<User>, IUserRepository
    {
        public UserRepositorySp(TripMapperContext context) : base(context) { }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            var pUsername = new SqlParameter("@Username", username.ToLower());

            var users = await _context.Users
                .FromSqlRaw("EXEC dbo.User_GetByUsername @Username", pUsername)
                .AsNoTracking()
                .ToListAsync();

            return users.FirstOrDefault();
        }

        public async Task<bool> ExistsAsync(string username)
        {
            var pUsername = new SqlParameter("@Username", username.ToLower());

            var users = await _context.Users
                .FromSqlRaw("EXEC dbo.User_GetByUsername @Username", pUsername)
                .AsNoTracking()
                .ToListAsync();

            return users.Any();
        }
    }
}

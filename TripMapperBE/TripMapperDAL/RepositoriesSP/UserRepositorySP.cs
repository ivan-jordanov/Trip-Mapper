using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

    namespace TripMapperDAL.RepositoriesSP
{
    public class UserRepositorySP : GenericRepositorySP<User>, IUserRepositorySP
    {
        public UserRepositorySP(TripMapperContext context) : base(context, "User") { }

        public override async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .FromSqlRaw("EXEC sp_User_GetAll")
                .AsNoTracking()
                .ToListAsync();
        }

        public override async Task<User?> GetByIdAsync(int id)
        {
            var pId = new SqlParameter("@Id", id);
            
            var users = await _context.Users
                .FromSqlRaw("EXEC sp_User_GetById @Id", pId)
                .AsNoTracking()
                .ToListAsync();

            return users.FirstOrDefault();
        }

        public override async Task<User> AddAsync(User entity)
        {
            var parameters = new[]
            {
                CreateParameter("@Username", entity.Username),
                CreateParameter("@PasswordHash", entity.PasswordHash),
                CreateParameter("@PasswordSalt", entity.PasswordSalt),
                CreateParameter("@Gender", entity.Gender),
                CreateParameter("@City", entity.City),
                CreateParameter("@Country", entity.Country),
                CreateParameter("@KnownAs", entity.KnownAs),
                CreateOutputParameter("@NewId", SqlDbType.Int)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_User_Add";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            using var reader = await cmd.ExecuteReaderAsync();
            
            User? newUser = null;
            if (await reader.ReadAsync())
            {
                newUser = new User
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Username = reader.GetString(reader.GetOrdinal("Username")),
                    PasswordHash = (byte[])reader["PasswordHash"],
                    PasswordSalt = (byte[])reader["PasswordSalt"],
                    Gender = reader["Gender"] as string,
                    City = reader["City"] as string,
                    Country = reader["Country"] as string,
                    KnownAs = reader["KnownAs"] as string
                };
            }

            return newUser ?? throw new Exception("Failed to create user");
        }

        public override async Task<User> UpdateAsync(User entity)
        {
            var parameters = new[]
            {
                CreateParameter("@Id", entity.Id),
                CreateParameter("@Username", entity.Username),
                CreateParameter("@PasswordHash", entity.PasswordHash),
                CreateParameter("@PasswordSalt", entity.PasswordSalt),
                CreateParameter("@Gender", entity.Gender),
                CreateParameter("@City", entity.City),
                CreateParameter("@Country", entity.Country),
                CreateParameter("@KnownAs", entity.KnownAs)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_User_Update";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            using var reader = await cmd.ExecuteReaderAsync();
            
            User? updatedUser = null;
            if (await reader.ReadAsync())
            {
                updatedUser = new User
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Username = reader.GetString(reader.GetOrdinal("Username")),
                    PasswordHash = (byte[])reader["PasswordHash"],
                    PasswordSalt = (byte[])reader["PasswordSalt"],
                    Gender = reader["Gender"] as string,
                    City = reader["City"] as string,
                    Country = reader["Country"] as string,
                    KnownAs = reader["KnownAs"] as string
                };
            }

            return updatedUser ?? throw new Exception("Failed to update user");
        }

        public override async Task<bool> DeleteAsync(int id)
        {
            var pId = new SqlParameter("@Id", id);

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_User_Delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(pId);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        // Custom methods
        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username.ToLower());
        }

        public async Task<bool> ExistsAsync(string username)
        {
            return await _context.Users
                .AnyAsync(u => u.Username == username.ToLower());
        }

        // Synchronous Add method for backward compatibility
        public void Add(User entity)
        {
            _context.Users.Add(entity);
        }
    }
}

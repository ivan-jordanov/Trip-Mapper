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
    public class TripAccessRepositorySP : ITripAccessRepositorySP
    {
        protected readonly TripMapperContext _context;

        public TripAccessRepositorySP(TripMapperContext context)
        {
            _context = context;
        }

        public async Task<TripAccess?> GetByIdAsync(int tripId, int userId)
        {
            var parameters = new[]
            {
                new SqlParameter("@TripId", tripId),
                new SqlParameter("@UserId", userId)
            };
            
            var tripAccesses = await _context.TripAccesses
                .FromSqlRaw("EXEC sp_TripAccess_GetById @TripId, @UserId", parameters)
                .AsNoTracking()
                .ToListAsync();

            return tripAccesses.FirstOrDefault();
        }

        public async Task<IEnumerable<TripAccess>> GetAllAsync()
        {
            return await _context.TripAccesses
                .FromSqlRaw("EXEC sp_TripAccess_GetAll")
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<TripAccess> AddAsync(TripAccess entity)
        {
            var parameters = new[]
            {
                new SqlParameter("@TripId", entity.TripId),
                new SqlParameter("@UserId", entity.UserId),
                new SqlParameter("@AccessLevel", entity.AccessLevel)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_TripAccess_Add";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            using var reader = await cmd.ExecuteReaderAsync();
            
            TripAccess? newTripAccess = null;
            if (await reader.ReadAsync())
            {
                newTripAccess = new TripAccess
                {
                    TripId = reader.GetInt32(reader.GetOrdinal("TripId")),
                    UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                    AccessLevel = reader.GetString(reader.GetOrdinal("AccessLevel"))
                };
            }

            return newTripAccess ?? throw new Exception("Failed to create trip access");
        }

        public async Task<TripAccess> UpdateAsync(TripAccess entity)
        {
            var parameters = new[]
            {
                new SqlParameter("@TripId", entity.TripId),
                new SqlParameter("@UserId", entity.UserId),
                new SqlParameter("@AccessLevel", entity.AccessLevel)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_TripAccess_Update";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            using var reader = await cmd.ExecuteReaderAsync();
            
            TripAccess? updatedTripAccess = null;
            if (await reader.ReadAsync())
            {
                updatedTripAccess = new TripAccess
                {
                    TripId = reader.GetInt32(reader.GetOrdinal("TripId")),
                    UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                    AccessLevel = reader.GetString(reader.GetOrdinal("AccessLevel"))
                };
            }

            return updatedTripAccess ?? throw new Exception("Failed to update trip access");
        }

        public async Task<bool> DeleteAsync(int tripId, int userId)
        {
            var parameters = new[]
            {
                new SqlParameter("@TripId", tripId),
                new SqlParameter("@UserId", userId)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_TripAccess_Delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        public async Task<TripAccess?> GetAccessAsync(int tripId, int userId)
        {
            return await _context.TripAccesses
                .FirstOrDefaultAsync(x => x.TripId == tripId && x.UserId == userId);
        }

        public async Task<List<TripAccess>> GetByTripIdAsync(int tripId)
        {
            return await _context.TripAccesses
                .Where(x => x.TripId == tripId)
                .ToListAsync();
        }

        public void Delete(TripAccess entity)
        {
            _context.TripAccesses.Remove(entity);
        }

        public IQueryable<TripAccess> Query()
        {
            return _context.Set<TripAccess>().AsQueryable();
        }
    }           
}

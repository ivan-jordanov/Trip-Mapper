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
    public class PhotoRepositorySP : GenericRepositorySP<Photo>, IPhotoRepositorySP
    {
        public PhotoRepositorySP(TripMapperContext context) : base(context, "Photo") { }

        public override async Task<IEnumerable<Photo>> GetAllAsync()
        {
            return await _context.Photos
                .FromSqlRaw("EXEC sp_Photo_GetAll")
                .AsNoTracking()
                .ToListAsync();
        }

        public override async Task<Photo?> GetByIdAsync(int id)
        {
            var pId = new SqlParameter("@Id", id);
            
            var photos = await _context.Photos
                .FromSqlRaw("EXEC sp_Photo_GetById @Id", pId)
                .AsNoTracking()
                .ToListAsync();

            return photos.FirstOrDefault();
        }

        public override async Task<Photo> AddAsync(Photo entity)
        {
            var parameters = new[]
            {
                CreateParameter("@Url", entity.Url),
                CreateParameter("@UploadedAt", entity.UploadedAt ?? DateTime.UtcNow),
                CreateParameter("@PinId", entity.PinId),
                CreateParameter("@TripId", entity.TripId),
                CreateOutputParameter("@NewId", SqlDbType.Int)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_Photo_Add";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            using var reader = await cmd.ExecuteReaderAsync();
            
            Photo? newPhoto = null;
            if (await reader.ReadAsync())
            {
                newPhoto = new Photo
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Url = reader.GetString(reader.GetOrdinal("Url")),
                    UploadedAt = reader["UploadedAt"] as DateTime?,
                    PinId = reader["PinId"] as int?,
                    TripId = reader["TripId"] as int?
                };
            }

            return newPhoto ?? throw new Exception("Failed to create photo");
        }

        public override async Task<Photo> UpdateAsync(Photo entity)
        {
            var parameters = new[]
            {
                CreateParameter("@Id", entity.Id),
                CreateParameter("@Url", entity.Url),
                CreateParameter("@PinId", entity.PinId),
                CreateParameter("@TripId", entity.TripId)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_Photo_Update";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            using var reader = await cmd.ExecuteReaderAsync();
            
            Photo? updatedPhoto = null;
            if (await reader.ReadAsync())
            {
                updatedPhoto = new Photo
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Url = reader.GetString(reader.GetOrdinal("Url")),
                    UploadedAt = reader["UploadedAt"] as DateTime?,
                    PinId = reader["PinId"] as int?,
                    TripId = reader["TripId"] as int?
                };
            }

            return updatedPhoto ?? throw new Exception("Failed to update photo");
        }

        public override async Task<bool> DeleteAsync(int id)
        {
            var pId = new SqlParameter("@Id", id);

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_Photo_Delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(pId);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }
    }
}

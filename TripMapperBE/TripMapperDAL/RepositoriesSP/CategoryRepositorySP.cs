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
    public class CategoryRepositorySP : GenericRepositorySP<Category>, ICategoryRepositorySP
    {
        public CategoryRepositorySP(TripMapperContext context) : base(context, "Category") { }

        public override async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _context.Categories
                .FromSqlRaw("EXEC sp_Category_GetAll")
                .AsNoTracking()
                .ToListAsync();
        }

        public override async Task<Category?> GetByIdAsync(int id)
        {
            var pId = new SqlParameter("@Id", id);
            
            var categories = await _context.Categories
                .FromSqlRaw("EXEC sp_Category_GetById @Id", pId)
                .AsNoTracking()
                .ToListAsync();

            return categories.FirstOrDefault();
        }

        public override async Task<Category> AddAsync(Category entity)
        {
            var parameters = new[]
            {
                CreateParameter("@Name", entity.Name),
                CreateParameter("@ColorCode", entity.ColorCode),
                CreateParameter("@IsDefault", entity.IsDefault),
                CreateParameter("@UserId", entity.UserId),
                CreateOutputParameter("@NewId", SqlDbType.Int)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_Category_Add";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            using var reader = await cmd.ExecuteReaderAsync();
            
            Category? newCategory = null;
            if (await reader.ReadAsync())
            {
                newCategory = new Category
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Name = reader.GetString(reader.GetOrdinal("Name")),
                    ColorCode = reader["ColorCode"] as string,
                    IsDefault = reader["IsDefault"] as string,
                    UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                    RowVersion = (byte[])reader["RowVersion"]
                };
            }

            return newCategory ?? throw new Exception("Failed to create category");
        }

        public override async Task<Category> UpdateAsync(Category entity)
        {
            var parameters = new[]
            {
                CreateParameter("@Id", entity.Id),
                CreateParameter("@Name", entity.Name),
                CreateParameter("@ColorCode", entity.ColorCode),
                CreateParameter("@IsDefault", entity.IsDefault),
                CreateParameter("@RowVersion", entity.RowVersion)
            };

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_Category_Update";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddRange(parameters);

            try
            {
                using var reader = await cmd.ExecuteReaderAsync();
                
                Category? updatedCategory = null;
                if (await reader.ReadAsync())
                {
                    updatedCategory = new Category
                    {
                        Id = reader.GetInt32(reader.GetOrdinal("Id")),
                        Name = reader.GetString(reader.GetOrdinal("Name")),
                        ColorCode = reader["ColorCode"] as string,
                        IsDefault = reader["IsDefault"] as string,
                        UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                        RowVersion = (byte[])reader["RowVersion"]
                    };
                }

                return updatedCategory ?? throw new DbUpdateConcurrencyException("Category was modified by another user");
            }
            catch (SqlException ex) when (ex.Number == 50002)
            {
                throw new DbUpdateConcurrencyException("Category was modified by another user", ex);
            }
        }

        public override async Task<bool> DeleteAsync(int id)
        {
            var pId = new SqlParameter("@Id", id);

            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "sp_Category_Delete";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(pId);

            var rowsAffected = await cmd.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        public async Task<IEnumerable<Category>> GetCategoriesForUserAsync(int userId)
        {
            return await _context.Categories
                .Where(c => c.UserId == userId)
                .ToListAsync();
        }
    }
}

using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperDAL.Repositories
{
    public class CategoryRepositorySp : GenericRepository<Category>, ICategoryRepository
    {
        public CategoryRepositorySp(TripMapperContext context) : base(context)
        {
        }

        public async Task<List<Category>> GetCategoriesForUserAsync(int userId)
        {
            return await _context.Categories
                .FromSqlRaw("EXEC dbo.Category_GetForUser @UserId = {0}", userId)
                .ToListAsync();
        }
    }
}

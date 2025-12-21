using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperDAL.Repositories
{
    public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
    {
        public CategoryRepository(TripMapperContext context) : base(context)
        {
            
        }

        public async Task<List<Category>> GetCategoriesForUserAsync(int userId)
        {
            return await _context.Categories
                .Where(c => c.UserId == userId || c.IsDefault == "True")
                .ToListAsync();
        }

    }
}

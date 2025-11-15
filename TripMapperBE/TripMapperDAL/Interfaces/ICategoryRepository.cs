using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface ICategoryRepository : IGenericRepository<Category> {
        Task<List<Category>> GetCategoriesForUserAsync(int userId);
    }
}

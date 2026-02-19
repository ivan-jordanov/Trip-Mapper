using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface ICategoryRepositorySP : IGenericRepositorySP<Category>
    {
        Task<IEnumerable<Category>> GetCategoriesForUserAsync(int userId);
    }
}
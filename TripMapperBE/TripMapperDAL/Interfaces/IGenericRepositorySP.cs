using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TripMapperDAL.Interfaces
{
    public interface IGenericRepositorySP<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T?> GetByIdAsync(int id);
        Task<T> AddAsync(T entity);
        Task<T> UpdateAsync(T entity);
        Task<bool> DeleteAsync(int id);
        IQueryable<T> Query(); 
    }
}
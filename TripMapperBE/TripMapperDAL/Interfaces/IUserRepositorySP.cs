using System.Linq;
using System.Threading.Tasks;
using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface IUserRepositorySP : IGenericRepositorySP<User>
    {
        Task<User?> GetByUsernameAsync(string username);
        Task<bool> ExistsAsync(string username);
        void Add(User entity);
    }
}
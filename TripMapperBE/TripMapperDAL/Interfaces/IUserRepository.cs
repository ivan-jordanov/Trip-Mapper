using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface IUserRepository : IGenericRepository<User> {

        Task<User?> GetByUsernameAsync(string username);
        Task<bool> ExistsAsync(string username);
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface IPinRepository : IGenericRepository<Pin> {
        Task<Pin?> GetByTitleAsync(string title, int userId);
    }
}

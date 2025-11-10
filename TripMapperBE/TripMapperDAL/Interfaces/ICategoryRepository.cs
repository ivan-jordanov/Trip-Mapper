using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface ICategoryRepository : IGenericRepository<Category> {
        void SetOriginalRowVersion(Category category, byte[] rowVersion);
        void Attach(Category category);
        void ClearTracking();
    }
}

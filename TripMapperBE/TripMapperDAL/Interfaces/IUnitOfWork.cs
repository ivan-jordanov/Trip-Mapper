using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TripMapperDAL.Interfaces
{
    public interface IUnitOfWork
    {
        IPinRepository Pins { get; }
        ITripRepository Trips { get; }
        IPhotoRepository Photos { get; }
        IUserRepository Users { get; }
        ICategoryRepository Categories { get; }
        ITripAccessRepository TripAccess{ get; }
        Task<bool> CompleteAsync();
        bool HasChanges();
        void ClearTracking();
    }

}

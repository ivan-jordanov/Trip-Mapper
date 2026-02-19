using System;
using System.Threading.Tasks;

namespace TripMapperDAL.Interfaces
{
    public interface IUnitOfWorkSP : IDisposable
    {
        ITripRepositorySP Trips { get; }
        IPinRepositorySP Pins { get; }
        IPhotoRepositorySP Photos { get; }
        ICategoryRepositorySP Categories { get; }
        IUserRepositorySP Users { get; }
        ITripAccessRepositorySP TripAccess { get; }

        Task<bool> CompleteAsync();
        void ClearTracking();
    }
}
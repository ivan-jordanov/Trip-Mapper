using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperDAL.RepositoriesSP
{
    public class UnitOfWorkSP : IUnitOfWorkSP
    {
        private readonly TripMapperContext _context;

        public ITripRepositorySP Trips { get; }
        public IPinRepositorySP Pins { get; }
        public IPhotoRepositorySP Photos { get; }
        public ICategoryRepositorySP Categories { get; }
        public IUserRepositorySP Users { get; }
        public ITripAccessRepositorySP TripAccess { get; }

        public UnitOfWorkSP(TripMapperContext context)
        {
            _context = context;
            Trips = new TripRepositorySP(context);
            Pins = new PinRepositorySP(context);
            Photos = new PhotoRepositorySP(context);
            Categories = new CategoryRepositorySP(context);
            Users = new UserRepositorySP(context);
            TripAccess = new TripAccessRepositorySP(context);
        }

        public async Task<bool> CompleteAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public void ClearTracking()
        {
            _context.ChangeTracker.Clear();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}

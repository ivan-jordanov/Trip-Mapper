using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperDAL.Repositories
{
    public class UnitOfWorkSp : IUnitOfWork
    {
        private readonly TripMapperContext _context;

        public IPinRepository Pins { get; }
        public ITripRepository Trips { get; }
        public IPhotoRepository Photos { get; }
        public IUserRepository Users { get; }
        public ICategoryRepository Categories { get; }
        public ITripAccessRepository TripAccess { get; }

        public UnitOfWorkSp(
            TripMapperContext context,
            IPinRepository pinRepo,
            ITripRepository tripRepo,
            IPhotoRepository photoRepo,
            IUserRepository userRepo,
            ICategoryRepository catRepo,
            ITripAccessRepository tripAccessRepo)
        {
            _context = context;
            Pins = pinRepo;
            Trips = tripRepo;
            Photos = photoRepo;
            Users = userRepo;
            Categories = catRepo;
            TripAccess = tripAccessRepo;
        }

        public async Task<bool> CompleteAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public bool HasChanges() => _context.ChangeTracker.HasChanges();

        public void ClearTracking()
        {
            _context.ChangeTracker.Clear();
        }
    }
}

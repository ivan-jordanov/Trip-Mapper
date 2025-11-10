using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDB.Models;
using TripMapperDAL.Interfaces;

namespace TripMapperDAL.Repositories
{
    public class PinRepository : GenericRepository<Pin>, IPinRepository
    {
        public PinRepository(TripMapperContext context) : base(context) { }
    }
}

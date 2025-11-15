using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDB.Models;
using TripMapperDAL.Interfaces;

namespace TripMapperDAL.Repositories
{
    public class PhotoRepositorySp : GenericRepository<Photo>, IPhotoRepository
    {
        public PhotoRepositorySp(TripMapperContext context) : base(context) { }
    }
}

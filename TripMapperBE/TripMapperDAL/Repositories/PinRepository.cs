using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperDAL.Repositories
{
    public class PinRepository : GenericRepository<Pin>, IPinRepository
    {
        public PinRepository(TripMapperContext context) : base(context) { }

        public async Task<Pin?> GetByTitleAsync(string title, int userId)
        {
            return await _context.Pins.FirstOrDefaultAsync(u => u.Title == title.ToLower() && u.UserId == userId);
        }
    }
}

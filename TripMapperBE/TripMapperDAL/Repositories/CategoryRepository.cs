using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperDAL.Repositories
{
    public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
    {
        public CategoryRepository(TripMapperContext context) : base(context) { }

        // TODO: Remove rowversion methods & update functionality from category. Was experimenting, but its useless
        public void SetOriginalRowVersion(Category category, byte[] rowVersion)
        {
            var entry = _context.Entry(category);
            entry.Property("RowVersion").OriginalValue = rowVersion;
        }

        public void Attach(Category category)
        {
            _context.Categories.Attach(category);
            _context.Entry(category).State = EntityState.Modified;
        }

        public void ClearTracking()
        {
            _context.ChangeTracker.Clear();
        }
    }
}

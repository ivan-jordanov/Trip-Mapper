using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using TripMapperDAL.Interfaces;
using System.Linq;
using TripMapperDB.Models;
using TripMapperDAL.Interfaces;

namespace TripMapperDAL.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly TripMapperContext _context;
        protected readonly DbSet<T> _dbSet;

        public GenericRepository(TripMapperContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public IEnumerable<T> GetAll() => _dbSet.ToList();

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }


        public T? GetById(int id) => _dbSet.Find(id);

        public async Task<T?> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public void Add(T entity) => _dbSet.Add(entity);
        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
        }

        public void Update(T entity) => _dbSet.Update(entity);

        public void Delete(int id)
        {
            var entity = _dbSet.Find(id);
            if (entity != null)
                _dbSet.Remove(entity);
        }

        public void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }

        public IQueryable<T> Query()
        {
            return _context.Set<T>().AsQueryable();
        }


    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperDB.Models;

namespace TripMapperDAL.Interfaces
{
    public interface IGenericRepository<T> where T : class
    {
        IEnumerable<T> GetAll();
        Task<IEnumerable<T>> GetAllAsync();
        T? GetById(int id);
        Task<T?> GetByIdAsync(int id);
        void Add(T entity);
        Task AddAsync(T entity);
        void Update(T entity);
        void Delete(int id);
        void Delete(T entity);
        IQueryable<T> Query();


    }
}

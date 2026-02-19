using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperDAL.RepositoriesSP
{
    public abstract class GenericRepositorySP<T> : IGenericRepositorySP<T> where T : class
    {
        protected readonly TripMapperContext _context;
        protected readonly string _tableName;

        protected GenericRepositorySP(TripMapperContext context, string tableName)  
        {
            _context = context;
            _tableName = tableName;
        }
        public abstract Task<IEnumerable<T>> GetAllAsync();
        public abstract Task<T?> GetByIdAsync(int id);
        public abstract Task<T> AddAsync(T entity);
        public abstract Task<T> UpdateAsync(T entity);
        public abstract Task<bool> DeleteAsync(int id);

        // Query() for complex scenarios that cant use stored procedures
        public virtual IQueryable<T> Query()
        {
            return _context.Set<T>().AsQueryable();
        }

        protected SqlParameter CreateParameter(string name, object? value)
        {
            return new SqlParameter(name, value ?? DBNull.Value);
        }

        protected SqlParameter CreateOutputParameter(string name, SqlDbType type)
        {
            return new SqlParameter
            {
                ParameterName = name,
                SqlDbType = type,
                Direction = ParameterDirection.Output
            };
        }
    }
}
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperBL.DTOs;
using TripMapperBL.Interfaces;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapperBL.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public CategoryService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync(int currentUserId)
        {
            var categories = await _uow.Categories.GetCategoriesForUserAsync(currentUserId);

            return _mapper.Map<IEnumerable<CategoryDto>>(categories);
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(int id, int currentUserId)
        {
            var category = await _uow.Categories.GetByIdAsync(id);
            if (category == null || category.UserId != currentUserId) return null;

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto, int currentUserId)
        {
            var category = _mapper.Map<Category>(dto);
            category.UserId = currentUserId;

            await _uow.Categories.AddAsync(category);
            await _uow.CompleteAsync();

            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<bool> DeleteCategoryAsync(int id, int currentUserId)
        {
            var category = await _uow.Categories.GetByIdAsync(id);
            if (category == null || category.UserId != currentUserId) return false;

            _uow.Categories.Delete(category.Id);

            return await _uow.CompleteAsync();
        }
    }

}

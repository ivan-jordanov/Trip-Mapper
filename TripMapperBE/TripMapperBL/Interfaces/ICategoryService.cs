using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TripMapperBL.DTOs;

namespace TripMapperBL.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync(int currentUserId);
        Task<CategoryDto?> GetCategoryByIdAsync(int id, int currentUserId);
        Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto, int currentUserId);
        Task<bool> DeleteCategoryAsync(int id, int currentUserId);
    }
}

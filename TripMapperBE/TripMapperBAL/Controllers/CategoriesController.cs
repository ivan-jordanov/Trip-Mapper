using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using TripMapper.Controllers;
using TripMapperAPI.Extensions;
using TripMapperBL.DTOs;
using TripMapperBL.Interfaces;
using TripMapperDAL.Interfaces;
using TripMapperDB.Models;

namespace TripMapper.Controllers
{
    public class CategoriesController : BaseApiController
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {

            var userId = User.GetUserId();
            return Ok(await _categoryService.GetAllCategoriesAsync(userId));

        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {

            var userId = User.GetUserId();
            var category = await _categoryService.GetCategoryByIdAsync(id, userId);
            if (category == null) return NotFound();
            return Ok(category);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory(CreateCategoryDto dto)
        {
            var userId = User.GetUserId();
            var result = await _categoryService.CreateCategoryAsync(dto, userId);
            return CreatedAtAction(nameof(GetCategory), new { id = result.Id }, result);
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var userId = User.GetUserId();
            var success = await _categoryService.DeleteCategoryAsync(id, userId);
            if (!success) return BadRequest("Failed to delete category");
            return NoContent();
        }
    }
}

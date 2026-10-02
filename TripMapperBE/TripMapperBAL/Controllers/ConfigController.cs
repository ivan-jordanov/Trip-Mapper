using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TripMapper.Controllers
{
    [Authorize]
    public class ConfigController : BaseApiController
    {
        private readonly IConfiguration _configuration;

        public ConfigController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet("map-api-key")]
        public IActionResult GetMapApiKey()
        {
            var mapApiKey = _configuration["MAP_API_KEY"];
            return string.IsNullOrWhiteSpace(mapApiKey)
                ? NotFound()
                : Ok(new { mapApiKey });
        }
    }
}
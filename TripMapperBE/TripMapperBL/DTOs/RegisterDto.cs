using System.ComponentModel.DataAnnotations;

namespace TripMapperBL.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        public string? KnownAs { get; set; }
        public string? Gender { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}

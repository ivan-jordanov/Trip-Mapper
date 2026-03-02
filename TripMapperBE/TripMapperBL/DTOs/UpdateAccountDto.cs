using System.ComponentModel.DataAnnotations;

namespace TripMapperBL.DTOs
{
    public class UpdateAccountDto
    {
        [StringLength(100)]
        public string? KnownAs { get; set; }

        [StringLength(20)]
        public string? Gender { get; set; }

        [StringLength(100)]
        public string? City { get; set; }

        [StringLength(100)]
        public string? Country { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TripMapperBL.DTOs
{
    public class CreateUserDto
    {
        public string Username { get; set; } = null!;
        public string? KnownAs { get; set; }
        public string? Email { get; set; }
        public string? Gender { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
    }
}

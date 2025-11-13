using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TripMapperBL.DTOs
{
    public class CreateTripDto
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateOnly? DateVisited { get; set; }
        public DateOnly? DateFrom { get; set; }

        public List<string>? Pins { get; set; } = new List<string>();
        public List<string>? SharedUsernames { get; set; } = new List<string>();
    }

}

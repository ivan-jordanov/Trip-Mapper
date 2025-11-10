using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TripMapperBL.DTOs
{
    public class UpdateTripDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateOnly? DateVisited { get; set; }
        public DateOnly? DateFrom { get; set; }
        public required List<string> SharedUsernames { get; set; }
        public byte[] RowVersion { get; set; } = null!;
    }
}

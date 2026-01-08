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
        public List<string>? SharedUsernames { get; set; } = new List<string>();
        public List<string>? Pins { get; set; } = new List<string>();
        public List<int>? PhotoIdsToDelete { get; set; } = new List<int>();
        public byte[] RowVersion { get; set; } = null!;
    }
}

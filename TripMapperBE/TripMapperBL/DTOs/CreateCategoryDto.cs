using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TripMapperBL.DTOs
{
    public class CreateCategoryDto
    {
        public string? Name { get; set; }
        public string? ColorCode { get; set; }
        public bool? IsDefault { get; set; }
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    }
}

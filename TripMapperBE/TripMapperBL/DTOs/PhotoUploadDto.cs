using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TripMapperBL.DTOs
{
    public class PhotoUploadDto
    {
        public string FileName { get; set; } = null!;
        public string? ContentType { get; set; }
        public Stream Stream { get; set; } = null!;
    }
}

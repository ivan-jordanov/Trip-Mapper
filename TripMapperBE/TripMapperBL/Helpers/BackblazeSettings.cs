using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TripMapperBL.Helpers
{
    public class BackblazeSettings
    {
        public string Endpoint { get; set; } = "https://s3.eu-central-003.backblazeb2.com";
        public string BucketName { get; set; } = null!;
        public string KeyId { get; set; } = null!;
        public string ApplicationKey { get; set; } = null!;
    }
}

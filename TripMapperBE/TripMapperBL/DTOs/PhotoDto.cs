namespace TripMapperBL.DTOs
{
    public class PhotoDto
    {
        public int Id { get; set; }
        public string Url { get; set; } = null!;
        public DateTime? UploadedAt { get; set; }
        public int? PinId { get; set; }
        public int? TripId { get; set; }
    }
}

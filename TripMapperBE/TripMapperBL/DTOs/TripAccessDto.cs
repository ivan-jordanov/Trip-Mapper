namespace TripMapperBL.DTOs
{
    public class TripAccessDto
    {
        public int TripId { get; set; }
        public int UserId { get; set; }
        public string AccessLevel { get; set; } = null!;
    }
}

namespace TripMapperBL.DTOs
{
    public class CreatePinDto
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime? DateVisited { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? CategoryId { get; set; }
        public int? UserId { get; set; }
    }
}

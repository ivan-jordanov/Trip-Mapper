namespace TripMapperBL.DTOs
{
    public class PinDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime? DateVisited { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? CategoryId { get; set; }
        public int? UserId { get; set; }        
        public decimal? Latitude { get; set; };
        public decimal? Longitude { get; set; };
        public CategoryDto? Category { get; set; }
        public UserDto? User { get; set; }
        public ICollection<PhotoDto>? Photos { get; set; }
        public object? Trip { get; internal set; }
    }
}

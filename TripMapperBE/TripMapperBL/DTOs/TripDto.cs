namespace TripMapperBL.DTOs
{
    public class TripDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateOnly? DateVisited { get; set; }
        public DateOnly? DateFrom { get; set; }
        public byte[] RowVersion { get; set; }
        public ICollection<PinDto>? Pins { get; set; }
        public ICollection<PhotoDto>? Photos { get; set; }
    }
}

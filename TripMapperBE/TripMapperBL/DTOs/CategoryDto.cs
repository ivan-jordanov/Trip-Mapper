namespace TripMapperBL.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? ColorCode { get; set; }
        public bool IsDefault { get; set; }
        public int? UserId { get; set; }
        public byte[] RowVersion { get; set; }
    }
}

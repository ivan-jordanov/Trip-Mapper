namespace TripMapperBL.DTOs
{
    public class GrantTripAccessDto
    {
        public string Username { get; set; } = null!;
        public string AccessLevel { get; set; } = "View";
    }
}
namespace TripMapperBL.DTOs
{
    public class FriendDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? KnownAs { get; set; }
        public DateTime FriendsSince { get; set; }
    }
}

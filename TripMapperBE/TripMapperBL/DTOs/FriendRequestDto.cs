using TripMapperDB.Models;

namespace TripMapperBL.DTOs
{
    public class FriendRequestDto
    {
        public int Id { get; set; }
        public int RequesterId { get; set; }
        public int AddresseeId { get; set; }
        public string RequesterUsername { get; set; } = string.Empty;
        public string? RequesterKnownAs { get; set; }
        public string AddresseeUsername { get; set; } = string.Empty;
        public string? AddresseeKnownAs { get; set; }
        public FriendRequestStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
    }
}

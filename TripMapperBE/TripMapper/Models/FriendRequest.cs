using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TripMapperDB.Models
{
    [Table("FriendRequest")]
    public partial class FriendRequest
    {
        [Key]
        public int Id { get; set; }

        public int RequesterId { get; set; }

        public int AddresseeId { get; set; }

        [Required]
        [StringLength(20)]
        public FriendRequestStatus Status { get; set; } = FriendRequestStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? RespondedAt { get; set; }

        [ForeignKey(nameof(RequesterId))]
        [InverseProperty("SentFriendRequests")]
        public virtual User Requester { get; set; } = null!;

        [ForeignKey(nameof(AddresseeId))]
        [InverseProperty("ReceivedFriendRequests")]
        public virtual User Addressee { get; set; } = null!;
    }
}

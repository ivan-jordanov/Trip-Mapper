using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace TripMapperDB.Models;

[PrimaryKey("TripId", "UserId")]
[Table("TripAccess")]
public partial class TripAccess
{
    [Key]
    public int TripId { get; set; }

    [Key]
    public int UserId { get; set; }

    [StringLength(20)]
    public string AccessLevel { get; set; } = null!;

    [ForeignKey("TripId")]
    [InverseProperty("TripAccesses")]
    public virtual Trip Trip { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("TripAccesses")]
    public virtual User User { get; set; } = null!;
}

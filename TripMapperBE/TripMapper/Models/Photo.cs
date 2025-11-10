using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace TripMapperDB.Models;

[Table("Photo")]
public partial class Photo
{
    [Key]
    public int Id { get; set; }

    [StringLength(300)]
    public string Url { get; set; } = null!;

    public DateTime? UploadedAt { get; set; }

    public int? PinId { get; set; }

    public int? TripId { get; set; }

    [ForeignKey("PinId")]
    [InverseProperty("Photos")]
    public virtual Pin? Pin { get; set; }

    [ForeignKey("TripId")]
    [InverseProperty("Photos")]
    public virtual Trip? Trip { get; set; }
}

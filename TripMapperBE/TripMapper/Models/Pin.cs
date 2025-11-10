using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace TripMapperDB.Models;

[Table("Pin")]
public partial class Pin
{
    [Key]
    public int Id { get; set; }

    [StringLength(100)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    public DateOnly? DateVisited { get; set; }

    public DateTime? CreatedAt { get; set; }

    public int CategoryId { get; set; }

    public int UserId { get; set; }

    public int? TripId { get; set; }

    [StringLength(50)]
    public string? City { get; set; }

    [StringLength(50)]
    public string? State { get; set; }

    [StringLength(50)]
    public string? Country { get; set; }

    [Column(TypeName = "decimal(9, 6)")]
    public decimal? Latitude { get; set; }

    [Column(TypeName = "decimal(9, 6)")]
    public decimal? Longitude { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("Pins")]
    public virtual Category Category { get; set; } = null!;

    [InverseProperty("Pin")]
    public virtual ICollection<Photo> Photos { get; set; } = new List<Photo>();

    [ForeignKey("TripId")]
    [InverseProperty("Pins")]
    public virtual Trip? Trip { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("Pins")]
    public virtual User User { get; set; } = null!;
}

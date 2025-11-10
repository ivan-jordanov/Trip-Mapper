using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace TripMapperDB.Models;

[Table("Trip")]
public partial class Trip
{
    [Key]
    public int Id { get; set; }

    [StringLength(100)]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateOnly? DateVisited { get; set; }

    public DateOnly? DateFrom { get; set; }

    public byte[] RowVersion { get; set; } = null!;

    [InverseProperty("Trip")]
    public virtual ICollection<Photo> Photos { get; set; } = new List<Photo>();

    [InverseProperty("Trip")]
    public virtual ICollection<Pin> Pins { get; set; } = new List<Pin>();

    [InverseProperty("Trip")]
    public virtual ICollection<TripAccess> TripAccesses { get; set; } = new List<TripAccess>();
}

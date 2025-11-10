using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace TripMapperDB.Models;

[Table("Category")]
public partial class Category
{
    [Key]
    public int Id { get; set; }

    [StringLength(50)]
    public string Name { get; set; } = null!;

    [StringLength(10)]
    public string? ColorCode { get; set; }

    [StringLength(10)]
    public string? IsDefault { get; set; }

    public int UserId { get; set; }

    public byte[] RowVersion { get; set; } = null!;

    [InverseProperty("Category")]
    public virtual ICollection<Pin> Pins { get; set; } = new List<Pin>();
}

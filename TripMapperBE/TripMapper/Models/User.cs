using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace TripMapperDB.Models;

[Table("User")]
public partial class User
{
    [Key]
    public int Id { get; set; }

    [StringLength(100)]
    public string Username { get; set; } = null!;

    public byte[] PasswordHash { get; set; } = null!;

    public byte[] PasswordSalt { get; set; } = null!;

    [StringLength(20)]
    public string? Gender { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? Country { get; set; }

    [StringLength(100)]
    public string? KnownAs { get; set; }

    [InverseProperty("User")]
    public virtual ICollection<Pin> Pins { get; set; } = new List<Pin>();

    [InverseProperty("User")]
    public virtual ICollection<TripAccess> TripAccesses { get; set; } = new List<TripAccess>();
}

using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace TripMapperDB.Models;

public partial class TripMapperContext : DbContext
{
    public TripMapperContext()
    {
    }

    public TripMapperContext(DbContextOptions<TripMapperContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Photo> Photos { get; set; }

    public virtual DbSet<Pin> Pins { get; set; }

    public virtual DbSet<Trip> Trips { get; set; }

    public virtual DbSet<TripAccess> TripAccesses { get; set; }

    public virtual DbSet<User> Users { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Category__3214EC07E1A9837D");

            entity.Property(e => e.IsDefault).IsFixedLength();
            entity.Property(e => e.RowVersion)
                .IsRowVersion()
                .IsConcurrencyToken();
        });

        modelBuilder.Entity<Photo>(entity =>
        {
            entity.HasOne(d => d.Pin).WithMany(p => p.Photos)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Photo_Pin");

            entity.HasOne(d => d.Trip).WithMany(p => p.Photos)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Photo_Trip");
        });

        modelBuilder.Entity<Pin>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Pin__3214EC07B44E5454");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Category).WithMany(p => p.Pins)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Pin_Category1");

            entity.HasOne(d => d.Trip).WithMany(p => p.Pins).HasConstraintName("FK_Pin_Trip1");

            entity.HasOne(d => d.User).WithMany(p => p.Pins)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Pin_User1");
        });

        modelBuilder.Entity<Trip>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Trip__3214EC075D072C33");

            entity.Property(e => e.RowVersion)
                .IsRowVersion()
                .IsConcurrencyToken();
        });

        modelBuilder.Entity<TripAccess>(entity =>
        {
            entity.Property(e => e.AccessLevel).HasDefaultValue("View");

            entity.HasOne(d => d.Trip).WithMany(p => p.TripAccesses).HasConstraintName("FK_TripAccess_Trip");

            entity.HasOne(d => d.User).WithMany(p => p.TripAccesses).HasConstraintName("FK_TripAccess_User");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__User__3214EC075B18D8E7");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

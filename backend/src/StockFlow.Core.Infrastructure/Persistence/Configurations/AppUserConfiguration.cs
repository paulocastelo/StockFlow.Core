using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Infrastructure.Persistence.Configurations;

public sealed class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
{
    public void Configure(EntityTypeBuilder<AppUser> builder)
    {
        builder.ToTable("users");

        builder.HasKey(user => user.Id);

        builder.Property(user => user.FullName)
            .HasMaxLength(180)
            .IsRequired();

        builder.Property(user => user.Email)
            .HasMaxLength(180)
            .IsRequired();

        builder.Property(user => user.PasswordHash)
            .HasMaxLength(500)
            .IsRequired();

        builder.HasIndex(user => user.Email)
            .IsUnique();
    }
}

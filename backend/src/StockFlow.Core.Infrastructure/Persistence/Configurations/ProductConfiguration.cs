using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Infrastructure.Persistence.Configurations;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");

        builder.HasKey(product => product.Id);

        builder.Property(product => product.Name)
            .HasMaxLength(180)
            .IsRequired();

        builder.Property(product => product.Sku)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(product => product.UnitPrice)
            .HasPrecision(18, 2);

        builder.HasIndex(product => product.Sku)
            .IsUnique();

        builder.HasOne<Category>()
            .WithMany()
            .HasForeignKey(product => product.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

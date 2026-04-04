using StockFlow.Core.Domain.Common;

namespace StockFlow.Core.Domain.Entities;

public sealed class Product : Entity
{
    public Guid CategoryId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Sku { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }
    public bool IsActive { get; private set; }

    private Product()
    {
    }

    public Product(Guid categoryId, string name, string sku, decimal unitPrice)
    {
        UpdateDetails(categoryId, name, sku, unitPrice);
        IsActive = true;
    }

    public void UpdateDetails(Guid categoryId, string name, string sku, decimal unitPrice)
    {
        if (categoryId == Guid.Empty)
        {
            throw new ArgumentException("Category is required.", nameof(categoryId));
        }

        if (unitPrice < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(unitPrice), "Unit price cannot be negative.");
        }

        CategoryId = categoryId;
        Name = string.IsNullOrWhiteSpace(name)
            ? throw new ArgumentException("Product name is required.", nameof(name))
            : name.Trim();
        Sku = string.IsNullOrWhiteSpace(sku)
            ? throw new ArgumentException("SKU is required.", nameof(sku))
            : sku.Trim().ToUpperInvariant();
        UnitPrice = unitPrice;
    }

    public void Deactivate() => IsActive = false;

    public void Activate() => IsActive = true;
}

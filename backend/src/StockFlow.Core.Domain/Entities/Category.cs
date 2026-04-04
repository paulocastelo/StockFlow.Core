using StockFlow.Core.Domain.Common;

namespace StockFlow.Core.Domain.Entities;

public sealed class Category : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    private Category()
    {
    }

    public Category(string name, string? description = null)
    {
        UpdateDetails(name, description);
    }

    public void UpdateDetails(string name, string? description)
    {
        Name = string.IsNullOrWhiteSpace(name)
            ? throw new ArgumentException("Category name is required.", nameof(name))
            : name.Trim();
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
    }
}

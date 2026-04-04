namespace StockFlow.Core.Application.Products.Contracts;

public sealed record ProductDto(
    Guid Id,
    Guid CategoryId,
    string Name,
    string Sku,
    decimal UnitPrice,
    bool IsActive);

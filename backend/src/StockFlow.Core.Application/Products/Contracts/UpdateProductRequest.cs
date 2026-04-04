namespace StockFlow.Core.Application.Products.Contracts;

public sealed record UpdateProductRequest(Guid CategoryId, string Name, string Sku, decimal UnitPrice, bool IsActive);

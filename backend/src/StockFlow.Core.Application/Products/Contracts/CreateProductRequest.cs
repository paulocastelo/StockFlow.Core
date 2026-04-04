namespace StockFlow.Core.Application.Products.Contracts;

public sealed record CreateProductRequest(Guid CategoryId, string Name, string Sku, decimal UnitPrice);

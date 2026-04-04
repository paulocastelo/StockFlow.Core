namespace StockFlow.Core.Application.Categories.Contracts;

public sealed record CreateCategoryRequest(string Name, string? Description);

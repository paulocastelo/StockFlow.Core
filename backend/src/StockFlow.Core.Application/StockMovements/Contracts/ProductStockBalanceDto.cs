namespace StockFlow.Core.Application.StockMovements.Contracts;

public sealed record ProductStockBalanceDto(Guid ProductId, int CurrentBalance);

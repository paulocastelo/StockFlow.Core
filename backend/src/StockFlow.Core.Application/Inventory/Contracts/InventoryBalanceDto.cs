namespace StockFlow.Core.Application.Inventory.Contracts;

public sealed record InventoryBalanceDto(Guid ProductId, int CurrentBalance);

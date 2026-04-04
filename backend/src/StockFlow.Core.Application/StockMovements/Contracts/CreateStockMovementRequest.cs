using StockFlow.Core.Domain.Enums;

namespace StockFlow.Core.Application.StockMovements.Contracts;

public sealed record CreateStockMovementRequest(
    Guid ProductId,
    StockMovementType Type,
    int Quantity,
    string? Reason,
    Guid? PerformedByUserId);

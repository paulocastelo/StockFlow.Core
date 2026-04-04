using StockFlow.Core.Domain.Enums;

namespace StockFlow.Core.Application.StockMovements.Contracts;

public sealed record StockMovementDto(
    Guid Id,
    Guid ProductId,
    StockMovementType Type,
    int Quantity,
    string? Reason,
    Guid? PerformedByUserId,
    DateTimeOffset OccurredAtUtc);

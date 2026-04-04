using StockFlow.Core.Domain.Common;
using StockFlow.Core.Domain.Enums;

namespace StockFlow.Core.Domain.Entities;

public sealed class StockMovement : Entity
{
    public Guid ProductId { get; private set; }
    public StockMovementType Type { get; private set; }
    public int Quantity { get; private set; }
    public string? Reason { get; private set; }
    public Guid? PerformedByUserId { get; private set; }
    public DateTimeOffset OccurredAtUtc { get; private set; }

    public StockMovement(
        Guid productId,
        StockMovementType type,
        int quantity,
        DateTimeOffset occurredAtUtc,
        string? reason = null,
        Guid? performedByUserId = null)
    {
        if (productId == Guid.Empty)
        {
            throw new ArgumentException("Product is required.", nameof(productId));
        }

        if (quantity <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be greater than zero.");
        }

        ProductId = productId;
        Type = type;
        Quantity = quantity;
        OccurredAtUtc = occurredAtUtc;
        Reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
        PerformedByUserId = performedByUserId;
    }

    public int GetSignedQuantity() => Type == StockMovementType.Entry ? Quantity : -Quantity;
}

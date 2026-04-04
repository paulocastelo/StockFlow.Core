using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Domain.Services;

public static class InventoryBalanceCalculator
{
    public static int Calculate(IEnumerable<StockMovement> movements)
    {
        ArgumentNullException.ThrowIfNull(movements);

        return movements.Sum(static movement => movement.GetSignedQuantity());
    }
}

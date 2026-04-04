using StockFlow.Core.Application.Inventory.Contracts;
using StockFlow.Core.Domain.Entities;
using StockFlow.Core.Domain.Services;

namespace StockFlow.Core.Application.Inventory.Services;

public sealed class InventoryBalanceAppService : IInventoryBalanceAppService
{
    public InventoryBalanceDto GetCurrentBalance(Guid productId, IEnumerable<StockMovement> movements)
    {
        if (productId == Guid.Empty)
        {
            throw new ArgumentException("Product is required.", nameof(productId));
        }

        ArgumentNullException.ThrowIfNull(movements);

        var filteredMovements = movements.Where(movement => movement.ProductId == productId);
        var currentBalance = InventoryBalanceCalculator.Calculate(filteredMovements);

        return new InventoryBalanceDto(productId, currentBalance);
    }
}

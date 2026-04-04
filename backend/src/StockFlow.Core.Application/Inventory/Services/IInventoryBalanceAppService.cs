using StockFlow.Core.Application.Inventory.Contracts;
using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Application.Inventory.Services;

public interface IInventoryBalanceAppService
{
    InventoryBalanceDto GetCurrentBalance(Guid productId, IEnumerable<StockMovement> movements);
}

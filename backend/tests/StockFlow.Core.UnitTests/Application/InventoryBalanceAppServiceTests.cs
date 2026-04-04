using StockFlow.Core.Application.Inventory.Services;
using StockFlow.Core.Domain.Entities;
using StockFlow.Core.Domain.Enums;

namespace StockFlow.Core.UnitTests.Application;

public sealed class InventoryBalanceAppServiceTests
{
    [Fact]
    public void GetCurrentBalance_FiltersMovementsByProduct()
    {
        var targetProductId = Guid.NewGuid();
        var otherProductId = Guid.NewGuid();
        var service = new InventoryBalanceAppService();

        var movements = new[]
        {
            new StockMovement(targetProductId, StockMovementType.Entry, 8, DateTimeOffset.UtcNow),
            new StockMovement(targetProductId, StockMovementType.Exit, 2, DateTimeOffset.UtcNow),
            new StockMovement(otherProductId, StockMovementType.Entry, 99, DateTimeOffset.UtcNow)
        };

        var result = service.GetCurrentBalance(targetProductId, movements);

        Assert.Equal(targetProductId, result.ProductId);
        Assert.Equal(6, result.CurrentBalance);
    }
}

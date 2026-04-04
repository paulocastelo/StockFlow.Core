using StockFlow.Core.Domain.Entities;
using StockFlow.Core.Domain.Enums;
using StockFlow.Core.Domain.Services;

namespace StockFlow.Core.UnitTests.Domain;

public sealed class InventoryBalanceCalculatorTests
{
    [Fact]
    public void Calculate_ReturnsExpectedBalance_WhenEntriesAndExitsExist()
    {
        var productId = Guid.NewGuid();
        var movements = new[]
        {
            new StockMovement(productId, StockMovementType.Entry, 10, DateTimeOffset.UtcNow),
            new StockMovement(productId, StockMovementType.Exit, 3, DateTimeOffset.UtcNow),
            new StockMovement(productId, StockMovementType.Entry, 2, DateTimeOffset.UtcNow)
        };

        var balance = InventoryBalanceCalculator.Calculate(movements);

        Assert.Equal(9, balance);
    }

    [Fact]
    public void Calculate_ReturnsZero_WhenNoMovementsExist()
    {
        var balance = InventoryBalanceCalculator.Calculate(Array.Empty<StockMovement>());

        Assert.Equal(0, balance);
    }
}

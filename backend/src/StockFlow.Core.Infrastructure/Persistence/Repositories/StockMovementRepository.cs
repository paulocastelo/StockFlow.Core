using Microsoft.EntityFrameworkCore;
using StockFlow.Core.Application.Abstractions.Persistence;
using StockFlow.Core.Domain.Entities;
using StockFlow.Core.Domain.Enums;

namespace StockFlow.Core.Infrastructure.Persistence.Repositories;

public sealed class StockMovementRepository : IStockMovementRepository
{
    private readonly StockFlowCoreDbContext _dbContext;

    public StockMovementRepository(StockFlowCoreDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task AddAsync(StockMovement movement, CancellationToken cancellationToken) =>
        _dbContext.StockMovements.AddAsync(movement, cancellationToken).AsTask();

    public async Task<IReadOnlyList<StockMovement>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken) =>
        await _dbContext.StockMovements
            .AsNoTracking()
            .Where(movement => movement.ProductId == productId)
            .OrderByDescending(movement => movement.OccurredAtUtc)
            .ToListAsync(cancellationToken);

    public async Task<int> GetCurrentBalanceAsync(Guid productId, CancellationToken cancellationToken)
    {
        var signedQuantities = await _dbContext.StockMovements
            .AsNoTracking()
            .Where(movement => movement.ProductId == productId)
            .Select(movement => movement.Type == StockMovementType.Entry
                ? movement.Quantity
                : -movement.Quantity)
            .ToListAsync(cancellationToken);

        return signedQuantities.Sum();
    }
}

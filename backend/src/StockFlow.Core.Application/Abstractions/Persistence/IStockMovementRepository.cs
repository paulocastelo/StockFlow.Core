using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Application.Abstractions.Persistence;

public interface IStockMovementRepository
{
    Task AddAsync(StockMovement movement, CancellationToken cancellationToken);
    Task<IReadOnlyList<StockMovement>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken);
    Task<int> GetCurrentBalanceAsync(Guid productId, CancellationToken cancellationToken);
}

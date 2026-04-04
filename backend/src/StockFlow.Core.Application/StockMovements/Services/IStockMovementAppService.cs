using StockFlow.Core.Application.StockMovements.Contracts;

namespace StockFlow.Core.Application.StockMovements.Services;

public interface IStockMovementAppService
{
    Task<StockMovementDto> CreateAsync(CreateStockMovementRequest request, CancellationToken cancellationToken);
    Task<IReadOnlyList<StockMovementDto>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken);
    Task<ProductStockBalanceDto> GetCurrentBalanceAsync(Guid productId, CancellationToken cancellationToken);
}

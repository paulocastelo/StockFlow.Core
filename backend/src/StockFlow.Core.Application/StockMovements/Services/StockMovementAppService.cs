using StockFlow.Core.Application.Abstractions.Persistence;
using StockFlow.Core.Application.Common.Exceptions;
using StockFlow.Core.Application.StockMovements.Contracts;
using StockFlow.Core.Domain.Entities;
using StockFlow.Core.Domain.Enums;

namespace StockFlow.Core.Application.StockMovements.Services;

public sealed class StockMovementAppService : IStockMovementAppService
{
    private readonly IProductRepository _productRepository;
    private readonly IStockMovementRepository _stockMovementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public StockMovementAppService(
        IProductRepository productRepository,
        IStockMovementRepository stockMovementRepository,
        IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _stockMovementRepository = stockMovementRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<StockMovementDto> CreateAsync(CreateStockMovementRequest request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken)
            ?? throw new NotFoundException($"Product '{request.ProductId}' was not found.");

        if (!product.IsActive)
        {
            throw new InvalidOperationException("Stock movements are only allowed for active products.");
        }

        if (request.Type == StockMovementType.Exit)
        {
            var currentBalance = await _stockMovementRepository.GetCurrentBalanceAsync(request.ProductId, cancellationToken);
            if (currentBalance < request.Quantity)
            {
                throw new InvalidOperationException("Insufficient stock for this exit movement.");
            }
        }

        var movement = new StockMovement(
            request.ProductId,
            request.Type,
            request.Quantity,
            DateTimeOffset.UtcNow,
            request.Reason,
            request.PerformedByUserId);

        await _stockMovementRepository.AddAsync(movement, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(movement);
    }

    public async Task<IReadOnlyList<StockMovementDto>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken)
    {
        if (!await _productRepository.ExistsAsync(productId, cancellationToken))
        {
            throw new NotFoundException($"Product '{productId}' was not found.");
        }

        var movements = await _stockMovementRepository.GetByProductIdAsync(productId, cancellationToken);
        return movements.Select(Map).ToList();
    }

    public async Task<ProductStockBalanceDto> GetCurrentBalanceAsync(Guid productId, CancellationToken cancellationToken)
    {
        if (!await _productRepository.ExistsAsync(productId, cancellationToken))
        {
            throw new NotFoundException($"Product '{productId}' was not found.");
        }

        var currentBalance = await _stockMovementRepository.GetCurrentBalanceAsync(productId, cancellationToken);
        return new ProductStockBalanceDto(productId, currentBalance);
    }

    private static StockMovementDto Map(StockMovement movement) =>
        new(
            movement.Id,
            movement.ProductId,
            movement.Type,
            movement.Quantity,
            movement.Reason,
            movement.PerformedByUserId,
            movement.OccurredAtUtc);
}

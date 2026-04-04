using StockFlow.Core.Application.Abstractions.Persistence;
using StockFlow.Core.Application.Common.Exceptions;
using StockFlow.Core.Application.StockMovements.Contracts;
using StockFlow.Core.Application.StockMovements.Services;
using StockFlow.Core.Domain.Entities;
using StockFlow.Core.Domain.Enums;

namespace StockFlow.Core.UnitTests.Application;

public sealed class StockMovementAppServiceTests
{
    [Fact]
    public async Task CreateAsync_Throws_WhenExitQuantityExceedsCurrentBalance()
    {
        var product = new Product(Guid.NewGuid(), "Mouse", "MOU-001", 100m);
        var productRepository = new FakeProductRepository(product);
        var movementRepository = new FakeStockMovementRepository(currentBalance: 2);
        var service = new StockMovementAppService(productRepository, movementRepository, new FakeUnitOfWork());

        var request = new CreateStockMovementRequest(product.Id, StockMovementType.Exit, 5, "Sale", null);

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.CreateAsync(request, CancellationToken.None));
    }

    [Fact]
    public async Task CreateAsync_Throws_WhenProductDoesNotExist()
    {
        var productRepository = new FakeProductRepository();
        var movementRepository = new FakeStockMovementRepository(currentBalance: 0);
        var service = new StockMovementAppService(productRepository, movementRepository, new FakeUnitOfWork());

        var request = new CreateStockMovementRequest(Guid.NewGuid(), StockMovementType.Entry, 5, "Purchase", null);

        await Assert.ThrowsAsync<NotFoundException>(() => service.CreateAsync(request, CancellationToken.None));
    }

    private sealed class FakeProductRepository : IProductRepository
    {
        private readonly List<Product> _products = [];

        public FakeProductRepository(params Product[] products)
        {
            _products.AddRange(products);
        }

        public Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<Product>>(_products);

        public Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult(_products.FirstOrDefault(product => product.Id == id));

        public Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken) =>
            Task.FromResult(_products.Any(product => product.Id == id));

        public Task AddAsync(Product product, CancellationToken cancellationToken)
        {
            _products.Add(product);
            return Task.CompletedTask;
        }
    }

    private sealed class FakeStockMovementRepository : IStockMovementRepository
    {
        private readonly int _currentBalance;

        public FakeStockMovementRepository(int currentBalance)
        {
            _currentBalance = currentBalance;
        }

        public Task AddAsync(StockMovement movement, CancellationToken cancellationToken) => Task.CompletedTask;

        public Task<IReadOnlyList<StockMovement>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<StockMovement>>(Array.Empty<StockMovement>());

        public Task<int> GetCurrentBalanceAsync(Guid productId, CancellationToken cancellationToken) =>
            Task.FromResult(_currentBalance);
    }

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken) => Task.FromResult(1);
    }
}

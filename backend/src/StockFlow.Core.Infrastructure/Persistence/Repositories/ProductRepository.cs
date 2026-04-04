using Microsoft.EntityFrameworkCore;
using StockFlow.Core.Application.Abstractions.Persistence;
using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Infrastructure.Persistence.Repositories;

public sealed class ProductRepository : IProductRepository
{
    private readonly StockFlowCoreDbContext _dbContext;

    public ProductRepository(StockFlowCoreDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken) =>
        await _dbContext.Products
            .AsNoTracking()
            .OrderBy(product => product.Name)
            .ToListAsync(cancellationToken);

    public Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        _dbContext.Products.FirstOrDefaultAsync(product => product.Id == id, cancellationToken);

    public Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken) =>
        _dbContext.Products.AnyAsync(product => product.Id == id, cancellationToken);

    public Task AddAsync(Product product, CancellationToken cancellationToken) =>
        _dbContext.Products.AddAsync(product, cancellationToken).AsTask();
}

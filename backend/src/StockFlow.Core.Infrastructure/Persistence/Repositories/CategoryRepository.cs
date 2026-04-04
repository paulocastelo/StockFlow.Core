using Microsoft.EntityFrameworkCore;
using StockFlow.Core.Application.Abstractions.Persistence;
using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Infrastructure.Persistence.Repositories;

public sealed class CategoryRepository : ICategoryRepository
{
    private readonly StockFlowCoreDbContext _dbContext;

    public CategoryRepository(StockFlowCoreDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken) =>
        await _dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .ToListAsync(cancellationToken);

    public Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        _dbContext.Categories.FirstOrDefaultAsync(category => category.Id == id, cancellationToken);

    public Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken) =>
        _dbContext.Categories.AnyAsync(category => category.Id == id, cancellationToken);

    public Task AddAsync(Category category, CancellationToken cancellationToken) =>
        _dbContext.Categories.AddAsync(category, cancellationToken).AsTask();

    public void Remove(Category category) => _dbContext.Categories.Remove(category);
}

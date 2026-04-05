using Microsoft.EntityFrameworkCore;
using StockFlow.Core.Application.Abstractions.Persistence;
using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Infrastructure.Persistence.Repositories;

public sealed class AppUserRepository : IAppUserRepository
{
    private readonly StockFlowCoreDbContext _dbContext;

    public AppUserRepository(StockFlowCoreDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
        _dbContext.Users.FirstOrDefaultAsync(user => user.Email == email, cancellationToken);

    public Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken) =>
        _dbContext.Users.AnyAsync(user => user.Email == email, cancellationToken);

    public Task AddAsync(AppUser user, CancellationToken cancellationToken) =>
        _dbContext.Users.AddAsync(user, cancellationToken).AsTask();
}

using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Application.Abstractions.Persistence;

public interface IAppUserRepository
{
    Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken);
    Task AddAsync(AppUser user, CancellationToken cancellationToken);
}

using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Application.Abstractions.Auth;

public interface IPasswordHasher
{
    string HashPassword(AppUser user, string password);
    bool VerifyPassword(AppUser user, string password, string passwordHash);
}

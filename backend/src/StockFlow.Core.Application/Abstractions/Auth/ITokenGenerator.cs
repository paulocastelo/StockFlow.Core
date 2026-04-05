using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Application.Abstractions.Auth;

public interface ITokenGenerator
{
    string GenerateToken(AppUser user);
}

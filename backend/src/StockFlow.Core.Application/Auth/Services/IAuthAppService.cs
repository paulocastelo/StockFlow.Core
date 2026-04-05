using StockFlow.Core.Application.Auth.Contracts;

namespace StockFlow.Core.Application.Auth.Services;

public interface IAuthAppService
{
    Task<UserProfileDto> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken);
    Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
}

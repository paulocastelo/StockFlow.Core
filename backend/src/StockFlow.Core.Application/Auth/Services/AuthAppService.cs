using StockFlow.Core.Application.Abstractions.Auth;
using StockFlow.Core.Application.Abstractions.Persistence;
using StockFlow.Core.Application.Auth.Contracts;
using StockFlow.Core.Application.Common.Exceptions;
using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Application.Auth.Services;

public sealed class AuthAppService : IAuthAppService
{
    private readonly IAppUserRepository _appUserRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenGenerator _tokenGenerator;
    private readonly IUnitOfWork _unitOfWork;

    public AuthAppService(
        IAppUserRepository appUserRepository,
        IPasswordHasher passwordHasher,
        ITokenGenerator tokenGenerator,
        IUnitOfWork unitOfWork)
    {
        _appUserRepository = appUserRepository;
        _passwordHasher = passwordHasher;
        _tokenGenerator = tokenGenerator;
        _unitOfWork = unitOfWork;
    }

    public async Task<UserProfileDto> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (await _appUserRepository.ExistsByEmailAsync(normalizedEmail, cancellationToken))
        {
            throw new InvalidOperationException("An account with this email already exists.");
        }

        var user = new AppUser(request.FullName, normalizedEmail, "pending");
        var passwordHash = _passwordHasher.HashPassword(user, request.Password);
        user.UpdatePasswordHash(passwordHash);

        await _appUserRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return MapUser(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _appUserRepository.GetByEmailAsync(normalizedEmail, cancellationToken)
            ?? throw new NotFoundException("Invalid email or password.");

        if (!_passwordHasher.VerifyPassword(user, request.Password, user.PasswordHash))
        {
            throw new NotFoundException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new InvalidOperationException("This account is inactive.");
        }

        var token = _tokenGenerator.GenerateToken(user);
        return new AuthResponseDto(
            token,
            DateTimeOffset.UtcNow.AddHours(8),
            MapUser(user));
    }

    private static UserProfileDto MapUser(AppUser user) =>
        new(user.Id, user.FullName, user.Email, user.IsActive);
}

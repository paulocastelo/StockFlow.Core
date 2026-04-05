using StockFlow.Core.Application.Abstractions.Auth;
using StockFlow.Core.Application.Abstractions.Persistence;
using StockFlow.Core.Application.Auth.Contracts;
using StockFlow.Core.Application.Auth.Services;
using StockFlow.Core.Application.Common.Exceptions;
using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.UnitTests.Application;

public sealed class AuthAppServiceTests
{
    [Fact]
    public async Task RegisterAsync_Throws_WhenEmailAlreadyExists()
    {
        var existingUser = new AppUser("Existing User", "existing@example.com", "hash");
        var service = new AuthAppService(
            new FakeAppUserRepository(existingUser),
            new FakePasswordHasher(),
            new FakeTokenGenerator(),
            new FakeUnitOfWork());

        var request = new RegisterUserRequest("New User", "existing@example.com", "Password123");

        await Assert.ThrowsAsync<InvalidOperationException>(() => service.RegisterAsync(request, CancellationToken.None));
    }

    [Fact]
    public async Task LoginAsync_Throws_WhenPasswordIsInvalid()
    {
        var existingUser = new AppUser("Existing User", "existing@example.com", "stored-hash");
        var service = new AuthAppService(
            new FakeAppUserRepository(existingUser),
            new FakePasswordHasher(verificationResult: false),
            new FakeTokenGenerator(),
            new FakeUnitOfWork());

        var request = new LoginRequest("existing@example.com", "wrong-password");

        await Assert.ThrowsAsync<NotFoundException>(() => service.LoginAsync(request, CancellationToken.None));
    }

    [Fact]
    public async Task LoginAsync_ReturnsToken_WhenCredentialsAreValid()
    {
        var existingUser = new AppUser("Existing User", "existing@example.com", "stored-hash");
        var service = new AuthAppService(
            new FakeAppUserRepository(existingUser),
            new FakePasswordHasher(verificationResult: true),
            new FakeTokenGenerator(),
            new FakeUnitOfWork());

        var response = await service.LoginAsync(
            new LoginRequest("existing@example.com", "Password123"),
            CancellationToken.None);

        Assert.Equal("fake-jwt-token", response.AccessToken);
        Assert.Equal(existingUser.Email, response.User.Email);
    }

    private sealed class FakeAppUserRepository : IAppUserRepository
    {
        private readonly List<AppUser> _users = [];

        public FakeAppUserRepository(params AppUser[] users)
        {
            _users.AddRange(users);
        }

        public Task<AppUser?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
            Task.FromResult(_users.FirstOrDefault(user => user.Email == email));

        public Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken) =>
            Task.FromResult(_users.Any(user => user.Email == email));

        public Task AddAsync(AppUser user, CancellationToken cancellationToken)
        {
            _users.Add(user);
            return Task.CompletedTask;
        }
    }

    private sealed class FakePasswordHasher : IPasswordHasher
    {
        private readonly bool _verificationResult;

        public FakePasswordHasher(bool verificationResult = true)
        {
            _verificationResult = verificationResult;
        }

        public string HashPassword(AppUser user, string password) => $"hashed::{password}";

        public bool VerifyPassword(AppUser user, string password, string passwordHash) => _verificationResult;
    }

    private sealed class FakeTokenGenerator : ITokenGenerator
    {
        public string GenerateToken(AppUser user) => "fake-jwt-token";
    }

    private sealed class FakeUnitOfWork : IUnitOfWork
    {
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken) => Task.FromResult(1);
    }
}

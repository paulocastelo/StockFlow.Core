using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using StockFlow.Core.Application.Abstractions.Auth;
using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Infrastructure.Auth;

public sealed class AppUserPasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int IterationCount = 10_000;

    public string HashPassword(AppUser user, string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = KeyDerivation.Pbkdf2(
            password,
            salt,
            KeyDerivationPrf.HMACSHA256,
            IterationCount,
            KeySize);

        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public bool VerifyPassword(AppUser user, string password, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(passwordHash))
        {
            return false;
        }

        var parts = passwordHash.Split('.', 2);
        if (parts.Length != 2)
        {
            return false;
        }

        var salt = Convert.FromBase64String(parts[0]);
        var expectedHash = Convert.FromBase64String(parts[1]);

        var computedHash = KeyDerivation.Pbkdf2(
            password,
            salt,
            KeyDerivationPrf.HMACSHA256,
            IterationCount,
            KeySize);

        return CryptographicOperations.FixedTimeEquals(computedHash, expectedHash);
    }
}

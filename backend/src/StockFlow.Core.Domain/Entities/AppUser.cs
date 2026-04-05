using StockFlow.Core.Domain.Common;

namespace StockFlow.Core.Domain.Entities;

public sealed class AppUser : Entity
{
    public string FullName { get; private set; }
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public bool IsActive { get; private set; }

    private AppUser()
    {
        FullName = string.Empty;
        Email = string.Empty;
        PasswordHash = string.Empty;
    }

    public AppUser(string fullName, string email, string passwordHash)
    {
        FullName = string.IsNullOrWhiteSpace(fullName)
            ? throw new ArgumentException("Full name is required.", nameof(fullName))
            : fullName.Trim();
        Email = string.IsNullOrWhiteSpace(email)
            ? throw new ArgumentException("Email is required.", nameof(email))
            : email.Trim().ToLowerInvariant();
        PasswordHash = string.IsNullOrWhiteSpace(passwordHash)
            ? throw new ArgumentException("Password hash is required.", nameof(passwordHash))
            : passwordHash;
        IsActive = true;
    }

    public void UpdatePasswordHash(string passwordHash)
    {
        PasswordHash = string.IsNullOrWhiteSpace(passwordHash)
            ? throw new ArgumentException("Password hash is required.", nameof(passwordHash))
            : passwordHash;
    }
}

using StockFlow.Core.Domain.Common;

namespace StockFlow.Core.Domain.Entities;

public sealed class AppUser : Entity
{
    public string FullName { get; private set; }
    public string Email { get; private set; }
    public bool IsActive { get; private set; }

    public AppUser(string fullName, string email)
    {
        FullName = string.IsNullOrWhiteSpace(fullName)
            ? throw new ArgumentException("Full name is required.", nameof(fullName))
            : fullName.Trim();
        Email = string.IsNullOrWhiteSpace(email)
            ? throw new ArgumentException("Email is required.", nameof(email))
            : email.Trim().ToLowerInvariant();
        IsActive = true;
    }
}

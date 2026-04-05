namespace StockFlow.Core.Application.Auth.Contracts;

public sealed record UserProfileDto(Guid Id, string FullName, string Email, bool IsActive);

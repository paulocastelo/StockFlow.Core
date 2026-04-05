namespace StockFlow.Core.Application.Auth.Contracts;

public sealed record RegisterUserRequest(string FullName, string Email, string Password);

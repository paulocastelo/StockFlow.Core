namespace StockFlow.Core.Application.Auth.Contracts;

public sealed record LoginRequest(string Email, string Password);

namespace StockFlow.Core.Application.Auth.Contracts;

public sealed record AuthResponseDto(
    string AccessToken,
    DateTimeOffset ExpiresAtUtc,
    UserProfileDto User);

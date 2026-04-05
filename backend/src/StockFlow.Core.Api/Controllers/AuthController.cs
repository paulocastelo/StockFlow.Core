using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlow.Core.Application.Auth.Contracts;
using StockFlow.Core.Application.Auth.Services;

namespace StockFlow.Core.Api.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthAppService _authAppService;

    public AuthController(IAuthAppService authAppService)
    {
        _authAppService = authAppService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserProfileDto>> Register(
        [FromBody] RegisterUserRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _authAppService.RegisterAsync(request, cancellationToken);
        return CreatedAtAction(nameof(Register), new { id = user.Id }, user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var response = await _authAppService.LoginAsync(request, cancellationToken);
        return Ok(response);
    }
}

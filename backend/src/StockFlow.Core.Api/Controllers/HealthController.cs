using Microsoft.AspNetCore.Mvc;

namespace StockFlow.Core.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new
    {
        service = "StockFlow.Core.Api",
        status = "ok",
        utcTime = DateTimeOffset.UtcNow
    });
}

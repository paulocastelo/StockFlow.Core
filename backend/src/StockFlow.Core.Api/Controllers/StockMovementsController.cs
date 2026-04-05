using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlow.Core.Application.StockMovements.Contracts;
using StockFlow.Core.Application.StockMovements.Services;

namespace StockFlow.Core.Api.Controllers;

[ApiController]
[Route("api/stock-movements")]
[Authorize]
public sealed class StockMovementsController : ControllerBase
{
    private readonly IStockMovementAppService _stockMovementAppService;

    public StockMovementsController(IStockMovementAppService stockMovementAppService)
    {
        _stockMovementAppService = stockMovementAppService;
    }

    [HttpPost]
    public async Task<ActionResult<StockMovementDto>> Create(
        [FromBody] CreateStockMovementRequest request,
        CancellationToken cancellationToken)
    {
        var movement = await _stockMovementAppService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetByProduct), new { productId = movement.ProductId }, movement);
    }

    [HttpGet("product/{productId:guid}")]
    public async Task<ActionResult<IReadOnlyList<StockMovementDto>>> GetByProduct(
        Guid productId,
        CancellationToken cancellationToken)
    {
        var movements = await _stockMovementAppService.GetByProductIdAsync(productId, cancellationToken);
        return Ok(movements);
    }

    [HttpGet("product/{productId:guid}/balance")]
    public async Task<ActionResult<ProductStockBalanceDto>> GetCurrentBalance(
        Guid productId,
        CancellationToken cancellationToken)
    {
        var balance = await _stockMovementAppService.GetCurrentBalanceAsync(productId, cancellationToken);
        return Ok(balance);
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlow.Core.Application.Categories.Contracts;
using StockFlow.Core.Application.Categories.Services;

namespace StockFlow.Core.Api.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public sealed class CategoriesController : ControllerBase
{
    private readonly ICategoryAppService _categoryAppService;

    public CategoriesController(ICategoryAppService categoryAppService)
    {
        _categoryAppService = categoryAppService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> GetAll(CancellationToken cancellationToken)
    {
        var categories = await _categoryAppService.GetAllAsync(cancellationToken);
        return Ok(categories);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CategoryDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var category = await _categoryAppService.GetByIdAsync(id, cancellationToken);
        return category is null ? NotFound() : Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = await _categoryAppService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CategoryDto>> Update(
        Guid id,
        [FromBody] UpdateCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var category = await _categoryAppService.UpdateAsync(id, request, cancellationToken);
        return Ok(category);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _categoryAppService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

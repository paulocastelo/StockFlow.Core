using StockFlow.Core.Application.Abstractions.Persistence;
using StockFlow.Core.Application.Common.Exceptions;
using StockFlow.Core.Application.Products.Contracts;
using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Application.Products.Services;

public sealed class ProductAppService : IProductAppService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ProductAppService(
        ICategoryRepository categoryRepository,
        IProductRepository productRepository,
        IUnitOfWork unitOfWork)
    {
        _categoryRepository = categoryRepository;
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<ProductDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var products = await _productRepository.GetAllAsync(cancellationToken);
        return products.Select(Map).ToList();
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(id, cancellationToken);
        return product is null ? null : Map(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request, CancellationToken cancellationToken)
    {
        await EnsureCategoryExistsAsync(request.CategoryId, cancellationToken);

        var product = new Product(request.CategoryId, request.Name, request.Sku, request.UnitPrice);
        await _productRepository.AddAsync(product, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(product);
    }

    public async Task<ProductDto> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException($"Product '{id}' was not found.");

        await EnsureCategoryExistsAsync(request.CategoryId, cancellationToken);

        product.UpdateDetails(request.CategoryId, request.Name, request.Sku, request.UnitPrice);
        if (request.IsActive)
        {
            product.Activate();
        }
        else
        {
            product.Deactivate();
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Map(product);
    }

    private async Task EnsureCategoryExistsAsync(Guid categoryId, CancellationToken cancellationToken)
    {
        if (!await _categoryRepository.ExistsAsync(categoryId, cancellationToken))
        {
            throw new NotFoundException($"Category '{categoryId}' was not found.");
        }
    }

    private static ProductDto Map(Product product) =>
        new(product.Id, product.CategoryId, product.Name, product.Sku, product.UnitPrice, product.IsActive);
}

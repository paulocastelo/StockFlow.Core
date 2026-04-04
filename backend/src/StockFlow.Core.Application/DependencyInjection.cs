using StockFlow.Core.Application.Categories.Services;
using Microsoft.Extensions.DependencyInjection;
using StockFlow.Core.Application.Inventory.Services;
using StockFlow.Core.Application.Products.Services;
using StockFlow.Core.Application.StockMovements.Services;

namespace StockFlow.Core.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IInventoryBalanceAppService, InventoryBalanceAppService>();
        services.AddScoped<ICategoryAppService, CategoryAppService>();
        services.AddScoped<IProductAppService, ProductAppService>();
        services.AddScoped<IStockMovementAppService, StockMovementAppService>();
        return services;
    }
}

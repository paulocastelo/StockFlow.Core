using Microsoft.Extensions.DependencyInjection;
using StockFlow.Core.Application.Inventory.Services;

namespace StockFlow.Core.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IInventoryBalanceAppService, InventoryBalanceAppService>();
        return services;
    }
}

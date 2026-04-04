using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StockFlow.Core.Application.Abstractions.Persistence;
using StockFlow.Core.Infrastructure.Persistence;
using StockFlow.Core.Infrastructure.Persistence.Repositories;

namespace StockFlow.Core.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("StockFlowCore");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'StockFlowCore' was not configured.");
        }

        services.AddDbContext<StockFlowCoreDbContext>(options => options.UseNpgsql(connectionString));
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IStockMovementRepository, StockMovementRepository>();
        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<StockFlowCoreDbContext>());

        return services;
    }
}

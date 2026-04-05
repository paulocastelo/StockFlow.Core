using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using StockFlow.Core.Application.Abstractions.Auth;
using StockFlow.Core.Application.Abstractions.Persistence;
using StockFlow.Core.Infrastructure.Auth;
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

        var jwtOptions = ReadAndValidateJwtOptions(configuration);
        services.AddSingleton<IOptions<JwtOptions>>(Options.Create(jwtOptions));

        services.AddDbContext<StockFlowCoreDbContext>(options => options.UseNpgsql(connectionString));
        services.AddScoped<IPasswordHasher, AppUserPasswordHasher>();
        services.AddScoped<ITokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IAppUserRepository, AppUserRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IStockMovementRepository, StockMovementRepository>();
        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<StockFlowCoreDbContext>());

        return services;
    }

    private static JwtOptions ReadAndValidateJwtOptions(IConfiguration configuration)
    {
        var section = configuration.GetSection(JwtOptions.SectionName);
        var options = new JwtOptions
        {
            Issuer = section["Issuer"] ?? string.Empty,
            Audience = section["Audience"] ?? string.Empty,
            SecurityKey = section["SecurityKey"] ?? string.Empty,
            ExpirationHours = int.TryParse(section["ExpirationHours"], out var hours) ? hours : 8
        };

        if (string.IsNullOrWhiteSpace(options.Issuer) ||
            string.IsNullOrWhiteSpace(options.Issuer) ||
            string.IsNullOrWhiteSpace(options.Audience) ||
            string.IsNullOrWhiteSpace(options.SecurityKey))
        {
            throw new InvalidOperationException("JWT options are not configured correctly.");
        }

        return options;
    }
}

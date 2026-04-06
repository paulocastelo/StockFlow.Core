using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StockFlow.Core.Application.Abstractions.Auth;
using StockFlow.Core.Domain.Entities;
using StockFlow.Core.Domain.Enums;

namespace StockFlow.Core.Infrastructure.Persistence.Development;

public sealed class DevelopmentDataSeeder
{
    private const string SeedUserEmail = "demo@stockflow.local";
    private const string SeedUserPassword = "Password123!";
    private const string CategoryPrefix = "Seed Category";
    private const string ProductSkuPrefix = "SEED";
    private const string MovementReasonPrefix = "Seed movement";
    private const int TargetCategoryCount = 10;
    private const int ProductsPerCategory = 20;
    private const int TargetMovementCount = 100;

    private static readonly string[] CategoryThemes =
    [
        "Electronics",
        "Office",
        "Maintenance",
        "Packaging",
        "Cleaning",
        "Furniture",
        "Hardware",
        "Safety",
        "Food Service",
        "Retail"
    ];

    private readonly StockFlowCoreDbContext _dbContext;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<DevelopmentDataSeeder> _logger;

    public DevelopmentDataSeeder(
        StockFlowCoreDbContext dbContext,
        IPasswordHasher passwordHasher,
        ILogger<DevelopmentDataSeeder> logger)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.Database.MigrateAsync(cancellationToken);

        var seedUser = await EnsureSeedUserAsync(cancellationToken);
        var categories = await EnsureCategoriesAsync(cancellationToken);
        var products = await EnsureProductsAsync(categories, cancellationToken);
        await EnsureMovementsAsync(products, seedUser.Id, cancellationToken);

        _logger.LogInformation(
            "Development seed ensured. User: {Email}, Categories: {CategoryCount}, Products: {ProductCount}, Movements: {MovementCount}",
            SeedUserEmail,
            await _dbContext.Categories.CountAsync(category => EF.Functions.Like(category.Name, $"{CategoryPrefix}%"), cancellationToken),
            await _dbContext.Products.CountAsync(product => EF.Functions.Like(product.Sku, $"{ProductSkuPrefix}-%"), cancellationToken),
            await _dbContext.StockMovements.CountAsync(
                movement => movement.PerformedByUserId == seedUser.Id &&
                            movement.Reason != null &&
                            EF.Functions.Like(movement.Reason, $"{MovementReasonPrefix}%"),
                cancellationToken));
    }

    private async Task<AppUser> EnsureSeedUserAsync(CancellationToken cancellationToken)
    {
        var existingUser = await _dbContext.Users.SingleOrDefaultAsync(user => user.Email == SeedUserEmail, cancellationToken);
        if (existingUser is not null)
        {
            return existingUser;
        }

        var user = new AppUser("Demo Operator", SeedUserEmail, "seed-placeholder");
        user.UpdatePasswordHash(_passwordHasher.HashPassword(user, SeedUserPassword));
        await _dbContext.Users.AddAsync(user, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return user;
    }

    private async Task<List<Category>> EnsureCategoriesAsync(CancellationToken cancellationToken)
    {
        var existingCategories = await _dbContext.Categories
            .Where(category => EF.Functions.Like(category.Name, $"{CategoryPrefix}%"))
            .OrderBy(category => category.Name)
            .ToListAsync(cancellationToken);

        if (existingCategories.Count >= TargetCategoryCount)
        {
            return existingCategories;
        }

        for (var index = existingCategories.Count; index < TargetCategoryCount; index++)
        {
            var sequence = index + 1;
            var theme = CategoryThemes[index % CategoryThemes.Length];
            var category = new Category(
                $"{CategoryPrefix} {sequence:00} - {theme}",
                $"{theme} inventory group created for local frontend verification.");

            await _dbContext.Categories.AddAsync(category, cancellationToken);
            existingCategories.Add(category);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return existingCategories.OrderBy(category => category.Name).ToList();
    }

    private async Task<List<Product>> EnsureProductsAsync(IReadOnlyList<Category> categories, CancellationToken cancellationToken)
    {
        var existingProducts = await _dbContext.Products
            .Where(product => EF.Functions.Like(product.Sku, $"{ProductSkuPrefix}-%"))
            .ToListAsync(cancellationToken);

        foreach (var category in categories.Select((value, index) => new { Category = value, Index = index + 1 }))
        {
            for (var productIndex = 1; productIndex <= ProductsPerCategory; productIndex++)
            {
                var sku = $"{ProductSkuPrefix}-C{category.Index:00}-P{productIndex:00}";
                if (existingProducts.Any(product => product.Sku == sku))
                {
                    continue;
                }

                var product = new Product(
                    category.Category.Id,
                    $"{CategoryThemes[(category.Index - 1) % CategoryThemes.Length]} Item {productIndex:00}",
                    sku,
                    10m + category.Index * 3m + productIndex * 1.75m);

                await _dbContext.Products.AddAsync(product, cancellationToken);
                existingProducts.Add(product);
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return await _dbContext.Products
            .Where(product => EF.Functions.Like(product.Sku, $"{ProductSkuPrefix}-%"))
            .OrderBy(product => product.Sku)
            .ToListAsync(cancellationToken);
    }

    private async Task EnsureMovementsAsync(IReadOnlyList<Product> products, Guid performedByUserId, CancellationToken cancellationToken)
    {
        var productIds = products.Select(product => product.Id).ToArray();
        var existingMovements = await _dbContext.StockMovements
            .Where(movement => productIds.Contains(movement.ProductId))
            .Where(movement => movement.PerformedByUserId == performedByUserId)
            .Where(movement => movement.Reason != null && EF.Functions.Like(movement.Reason, $"{MovementReasonPrefix}%"))
            .OrderBy(movement => movement.OccurredAtUtc)
            .ToListAsync(cancellationToken);

        if (existingMovements.Count >= TargetMovementCount)
        {
            return;
        }

        var balances = existingMovements
            .GroupBy(movement => movement.ProductId)
            .ToDictionary(
                group => group.Key,
                group => group.Sum(movement => movement.GetSignedQuantity()));

        foreach (var product in products)
        {
            balances.TryAdd(product.Id, 0);
        }

        var random = new Random(20260405);
        var nextSequence = existingMovements.Count + 1;
        var nextTimestamp = DateTimeOffset.UtcNow.AddDays(-20);

        while (nextSequence <= TargetMovementCount)
        {
            var product = products[random.Next(products.Count)];
            var currentBalance = balances[product.Id];
            var shouldCreateExit = currentBalance > 3 && random.NextDouble() > 0.45;
            var movementType = shouldCreateExit ? StockMovementType.Exit : StockMovementType.Entry;
            var quantity = movementType == StockMovementType.Entry
                ? random.Next(4, 16)
                : random.Next(1, Math.Min(currentBalance, 8) + 1);

            var movement = new StockMovement(
                product.Id,
                movementType,
                quantity,
                nextTimestamp.AddMinutes(nextSequence * 37),
                $"{MovementReasonPrefix} {nextSequence:000}",
                performedByUserId);

            await _dbContext.StockMovements.AddAsync(movement, cancellationToken);
            balances[product.Id] += movement.GetSignedQuantity();
            nextSequence++;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}

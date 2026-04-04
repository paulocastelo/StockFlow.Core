using Microsoft.EntityFrameworkCore;
using StockFlow.Core.Application.Abstractions.Persistence;
using StockFlow.Core.Domain.Entities;

namespace StockFlow.Core.Infrastructure.Persistence;

public sealed class StockFlowCoreDbContext : DbContext, IUnitOfWork
{
    public StockFlowCoreDbContext(DbContextOptions<StockFlowCoreDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<AppUser> Users => Set<AppUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(StockFlowCoreDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}

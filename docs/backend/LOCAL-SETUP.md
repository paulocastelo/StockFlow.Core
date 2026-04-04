# Backend Local Setup

## Requirements

- .NET SDK 9
- PostgreSQL running locally

## Default Connection String

The API is currently configured with this development connection string:

```text
Host=localhost;Port=5432;Database=stockflow_core;Username=postgres;Password=postgres
```

Update `backend/src/StockFlow.Core.Api/appsettings.Development.json` if your local PostgreSQL credentials are different.

## Apply Migrations

From the repository root:

```powershell
dotnet dotnet-ef database update `
  --project backend/src/StockFlow.Core.Infrastructure `
  --startup-project backend/src/StockFlow.Core.Api `
  --context StockFlow.Core.Infrastructure.Persistence.StockFlowCoreDbContext
```

## Run The API

```powershell
dotnet run --project backend/src/StockFlow.Core.Api
```

## Available MVP Endpoints

- `GET /api/health`
- `GET /api/categories`
- `GET /api/categories/{id}`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`
- `PUT /api/products/{id}`
- `POST /api/stock-movements`
- `GET /api/stock-movements/product/{productId}`
- `GET /api/stock-movements/product/{productId}/balance`

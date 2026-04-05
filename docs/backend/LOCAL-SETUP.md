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

After the API starts, Swagger UI should be available at:

```text
https://localhost:7xxx/swagger
http://localhost:5xxx/swagger
```

## JWT Configuration

The API expects a `Jwt` section in the app settings files. A development placeholder is already present, but the signing key should be changed before any non-local use.

## Authentication Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`

## Using JWT In Swagger

1. Register a user with `POST /api/auth/register`.
2. Login with `POST /api/auth/login`.
3. Copy the returned `accessToken`.
4. Click the `Authorize` button in Swagger.
5. Paste only the token value.
6. Call the protected endpoints normally.

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

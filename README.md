# StockFlow Core

StockFlow Core is the anchor project of this portfolio. It demonstrates a complete inventory management solution with a relational database, web frontend, mobile app, authentication, documentation, testing, and CI.

## Goal

Show full stack product delivery with a clean architecture and a realistic business domain.

## Scope

- products
- categories
- stock entries
- stock exits
- current balance
- movement history
- user authentication

## Suggested Stack

- Back-end: ASP.NET Core
- Database: PostgreSQL
- Web: Vue or React
- Mobile: Flutter
- Auth: JWT

## Delivery Order

1. API
2. database modeling and migrations
3. authentication and authorization
4. web frontend
5. Flutter app
6. unit tests
7. documentation
8. CI pipeline

## Repository Checklist

- README in English
- layered architecture
- simple architecture diagram
- OpenAPI or Swagger
- local setup guide
- screenshots
- short GIF demo
- basic unit tests
- GitHub Actions for build and test

## Initial Structure

- `backend`
- `frontend`
- `mobile`
- `docs`

## Notes

This project should be the most polished one in the portfolio.

## Current Backend MVP

The backend foundation is already in place with:

- ASP.NET Core Web API
- layered structure with `Domain`, `Application`, `Infrastructure`, and `Api`
- PostgreSQL persistence with EF Core
- initial migration for the database schema
- endpoints for categories, products, stock movements, and stock balance
- rule validation for stock exits
- unit tests for balance calculation and stock movement rules

## Backend Structure

- `backend/src/StockFlow.Core.Api`
- `backend/src/StockFlow.Core.Application`
- `backend/src/StockFlow.Core.Domain`
- `backend/src/StockFlow.Core.Infrastructure`
- `backend/tests/StockFlow.Core.UnitTests`

## Local Development

See [docs/backend/LOCAL-SETUP.md](C:/projetos/GitPortfolio/StockFlow.Core/docs/backend/LOCAL-SETUP.md) for PostgreSQL setup, migrations, and API run instructions.

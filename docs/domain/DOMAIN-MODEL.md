# Domain Model

This document defines the first domain model for `StockFlow.Core`.

## Business Context

`StockFlow.Core` is an inventory management system for small operations that need a clear and reliable way to register products, organize categories, and track stock movements over time.

## Core Entities

### Category

Represents the classification of products.

Key fields:

- `Id`
- `Name`
- `Description`

### Product

Represents an inventory item that can receive entries and exits.

Key fields:

- `Id`
- `CategoryId`
- `Name`
- `Sku`
- `UnitPrice`
- `IsActive`

### StockMovement

Represents a stock change event for a product.

Key fields:

- `Id`
- `ProductId`
- `Type`
- `Quantity`
- `Reason`
- `PerformedByUserId`
- `OccurredAtUtc`

### AppUser

Represents a system user who can authenticate and perform operations.

Key fields:

- `Id`
- `FullName`
- `Email`
- `IsActive`

## Domain Rules

- category name is required
- product must belong to a category
- product name is required
- SKU is required
- unit price cannot be negative
- stock movement must be linked to a product
- stock movement quantity must be greater than zero
- entry adds quantity to the balance
- exit subtracts quantity from the balance

## Initial Use Cases

- create category
- create product
- list products
- register stock entry
- register stock exit
- calculate current balance by product
- list movement history by product
- authenticate user

## Modeling Decision

For the MVP, current balance is treated as a value derived from stock movements. This keeps the business model explicit and favors traceability during the first version.

## Next Domain Step

The next step is to map these entities into the backend solution and define the first application use cases around products, categories, and stock movements.

# StockFlow Core Execution Plan

This document defines the execution plan for the first portfolio system, `StockFlow.Core`.

## Objective

Build the anchor project of the portfolio as a complete inventory management system with strong documentation, clean architecture, and end-to-end delivery.

## Product Goal

`StockFlow.Core` should be the repository that most clearly demonstrates:

- full stack product delivery
- relational data modeling
- API design
- authentication and authorization
- business rules around stock movement
- integration between backend, web, and mobile
- professional project packaging

## Scope

Initial functional scope:

- products
- categories
- stock entries
- stock exits
- current balance
- movement history
- user authentication

## Execution Principles

- start with the backend and business rules first
- keep the first version focused on a usable MVP
- document decisions as the project evolves
- treat tests and CI as required deliverables, not optional extras
- avoid expanding features before the main inventory flow is stable

## Implementation Phases

### Phase 1. Domain and Solution Foundation

Goal: define the core structure of the system before feature implementation.

Deliverables:

- domain definition
- core entities
- backend solution structure
- initial folder conventions
- planning and technical documentation

Exit criteria:

- project structure is defined
- main entities are named and documented
- execution order is clear

### Phase 2. Backend MVP

Goal: create a functional backend that supports the main stock flow.

Deliverables:

- ASP.NET Core solution
- layered architecture baseline
- PostgreSQL connection setup
- migrations
- CRUD for products and categories
- stock entry and stock exit operations
- current balance calculation
- movement history endpoints

Exit criteria:

- backend runs locally
- database schema is stable for MVP
- primary inventory use cases are functional

### Phase 3. Authentication and Authorization

Goal: secure the application with a simple but solid user access model.

Deliverables:

- user entity and auth flow
- JWT authentication
- protected endpoints
- basic authorization rules

Exit criteria:

- login flow works
- protected resources require authentication
- auth configuration is documented

### Phase 4. Testing and API Documentation

Goal: improve confidence and usability of the backend.

Deliverables:

- unit tests for core business rules
- tests for critical services
- Swagger or OpenAPI documentation
- sample requests and responses

Exit criteria:

- critical flows have automated coverage
- API surface is explorable and documented

### Phase 5. Web Frontend

Goal: provide a web interface for the main operational flows.

Deliverables:

- frontend project structure
- authentication screens
- product and category management
- stock movement screens
- balance and movement history views

Exit criteria:

- main user flows are usable from the web app
- frontend integrates cleanly with the API

### Phase 6. Flutter Mobile App

Goal: provide a mobile version of the core inventory experience.

Deliverables:

- Flutter app structure
- authenticated access
- product lookup
- stock movement flow
- balance consultation

Exit criteria:

- mobile app covers the key use cases
- app communicates correctly with the backend

### Phase 7. Polish and Public Release Preparation

Goal: make the repository presentation-ready.

Deliverables:

- final README
- architecture summary
- setup instructions
- environment variable documentation
- screenshots
- short demo GIF
- GitHub Actions pipeline

Exit criteria:

- repository is understandable to recruiters and reviewers
- project can be built and explored by another developer

## Recommended Delivery Order

1. Define entities and business rules.
2. Scaffold the ASP.NET Core backend.
3. Configure PostgreSQL and migrations.
4. Implement product and category flows.
5. Implement stock entry, exit, balance, and movement history.
6. Add authentication and authorization.
7. Add tests and Swagger.
8. Build the web frontend.
9. Build the Flutter mobile app.
10. Finalize docs, screenshots, and CI.

## Milestones

### Milestone 1

Planning, domain definition, and project structure completed.

### Milestone 2

Backend MVP completed.

### Milestone 3

Authentication and protected API completed.

### Milestone 4

Tests and API documentation completed.

### Milestone 5

Web frontend MVP completed.

### Milestone 6

Flutter mobile MVP completed.

### Milestone 7

Repository polished for public presentation.

## Risks

- expanding scope too early
- delaying tests and documentation
- building frontend before stabilizing core business rules
- overcomplicating the first version

## Mitigation

- keep the MVP focused on inventory essentials
- lock backend flows before broad UI expansion
- document technical decisions during implementation
- review every new feature against the anchor-project goal

## Next Action

The next implementation step should be domain definition and backend scaffolding for `StockFlow.Core`.


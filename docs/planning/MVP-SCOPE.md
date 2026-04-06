# StockFlow Core MVP Scope

This document defines what should be included in the first usable version of `StockFlow.Core`.

## In Scope

- user login
- product registration
- category registration
- stock entry
- stock exit
- current stock balance
- movement history
- API documentation
- basic unit tests

## Current Status

Already completed in the backend:

- user registration and login API
- JWT authentication
- category management API
- product management API
- stock movement API
- stock balance API
- Swagger documentation
- unit tests for key business and auth flows

Still pending for the MVP:

- CI automation for build and test confidence
- public-facing packaging items such as screenshots and final repository presentation polish

## Out Of Scope For The First Version

- multi-warehouse support
- advanced reporting dashboards
- barcode or QR integration
- audit trail beyond simple movement history
- role systems with complex permission matrices
- notifications
- offline sync

## MVP Success Criteria

The MVP is successful when:

- a user can authenticate
- products and categories can be managed
- stock can be increased and decreased safely
- balance can be queried reliably
- movement history is visible
- the API can be run and understood locally

## Guiding Rule

If a feature does not strengthen the core inventory flow for the first public version, it should be postponed.

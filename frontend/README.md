# StockFlow Core Frontend

React + Vite frontend for the `StockFlow.Core` web MVP.

## Current Scope

- user login and registration
- category creation and listing
- product creation and listing
- stock movement registration
- balance and movement history lookup

## Environment

Create a `.env.local` file if you want to override the API base URL:

```text
VITE_API_BASE_URL=http://localhost:5174
```

If `VITE_API_BASE_URL` is omitted, the Vite dev server will proxy `/api` requests to `http://localhost:5174`.

## Run

```powershell
npm install
npm run dev
```

## CI Validation

The repository CI workflow runs `npm ci`, `npm run lint`, and `npm run build` for this frontend on GitHub Actions.

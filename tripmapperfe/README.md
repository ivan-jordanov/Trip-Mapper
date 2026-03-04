# TripMapper Frontend

React frontend for Trip-Mapper, built with Mantine UI and Axios.

## Setup

```bash
npm install
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm start` — start development server
- `npm test` — run Jest tests in watch mode
- `npm run build` — production build

## Testing

This frontend uses Jest + React Testing Library.

Run all tests:

```bash
npm test
```

Run all focused portfolio suites added so far:

```bash
npm test -- --watchAll=false --runTestsByPath src/hooks/useAuth.test.js src/hooks/useCategories.test.js src/hooks/useTrips.test.js src/hooks/usePins.test.js src/pages/CategoriesPage.test.js src/components/auth/ProtectedRoute.test.js src/api/axios.test.js
```

### Current high-value coverage

- Custom hooks:
  - `src/hooks/useAuth.test.js`
  - `src/hooks/useCategories.test.js`
  - `src/hooks/useTrips.test.js`
  - `src/hooks/usePins.test.js`
- Page behavior:
  - `src/pages/CategoriesPage.test.js`
- Route guard:
  - `src/components/auth/ProtectedRoute.test.js`
- API interceptor logic:
  - `src/api/axios.test.js`

### What these tests validate

- CRUD state transitions in hooks (fetch/create/update/delete)
- Success/error handling and loading states
- Protected route redirect/authenticated rendering behavior
- Axios auth token injection, FormData header handling, and `401` redirect behavior

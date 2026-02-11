# Trip‑Mapper

Trip‑Mapper lets you plan and document trips with pins, photos, and secure sharing. It’s built with a clean separation between a .NET API and a React UI, enforcing JWT authorization, robust server‑side filtering and pagination, and cloud photo storage.

## Overview
- Create trips and add pins with geolocation, categories, and photos.
- Share trip access securely using `TripAccess` (Owner vs View) with JWT‑protected endpoints.
- Server‑side filtering + pagination for both trips and pins, with `/count` endpoints for precise totals.
- Photo lifecycle: upload to Backblaze, list on trips/pins, and safe deletion (storage + DB) on updates/deletes.
- Optimistic concurrency via `RowVersion` for trip updates/deletes to prevent overwrites.

## Tech Stack
- Backend: ASP.NET Core Web API; Entity Framework Core (SQL Server provider); AutoMapper for DTO mapping
- Data Access: Repository + Unit of Work patterns; optional Stored Procedure repository implementations
- Auth & Security: JWT (Issuer/Audience/Key), `[Authorize]` on controllers; per‑trip `TripAccess` checks; optimistic concurrency
- Frontend: React, Mantine UI components, Axios for API calls, Tabler Icons
- Storage: Backblaze B2 for photos; configurable via `appsettings.json`

## Architecture at a Glance
- Controllers (API): enforce auth and route requests
	- [TripsController](TripMapperBE/TripMapperBAL/Controllers/TripsController.cs), [PinsController](TripMapperBE/TripMapperBAL/Controllers/PinsController.cs)
- Services (BL): business rules, access checks, DTO mapping
	- [TripService](TripMapperBE/TripMapperBL/Services/TripService.cs), [PinService](TripMapperBE/TripMapperBL/Services/PinService.cs)
- Repositories (DAL): EF Core queries + Unit of Work
	- [TripRepository](TripMapperBE/TripMapperDAL/Repositories/TripRepository.cs), [PinRepository](TripMapperBE/TripMapperDAL/Repositories/PinRepository.cs), [UnitOfWork](TripMapperBE/TripMapperDAL/Repositories/UnitOfWork.cs)
- Models (DB): Trip, Pin, Photo, Category, User, TripAccess
	- [TripMapperBE/TripMapper/Models](TripMapperBE/TripMapper/Models)
- DI & Config: service registrations, CORS, JWT
	- [Program.cs](TripMapperBE/TripMapperBAL/Program.cs)
- Frontend (React): routing + page composition + feature components
	- App shell + routes: [tripmapperfe/src/App.js](tripmapperfe/src/App.js)
	- Pages: [tripmapperfe/src/pages](tripmapperfe/src/pages)
	- Components (feature UI): [tripmapperfe/src/components](tripmapperfe/src/components)
	- Hooks + auth state: [tripmapperfe/src/hooks](tripmapperfe/src/hooks), [tripmapperfe/src/context/AuthContext.js](tripmapperfe/src/context/AuthContext.js)
	- API + services: [tripmapperfe/src/api/axios.js](tripmapperfe/src/api/axios.js), [tripmapperfe/src/services](tripmapperfe/src/services), [tripmapperfe/src/modules](tripmapperfe/src/modules)

### Data Model (Concise)
- `Trip`: `Id`, `Title`, `Description`, `DateFrom?`, `DateVisited?`, `RowVersion`, `Photos[]`, `Pins[]`, `TripAccesses[]`
- `Pin`: `Id`, `Title`, `Description`, `Latitude`, `Longitude`, `DateVisited?`, `CreatedAt?`, `Category?`, `TripId?`, `Photos[]`, `UserId`
- `Photo`: `Id`, `Url`, `FileName`, `PinId?`, `TripId?`
- `TripAccess`: `TripId`, `UserId`, `AccessLevel` (`Owner`/`View`)
- `Category`: `Id`, `Name`, `ColorCode?`, `IsDefault?`, `UserId`, `RowVersion`
- `User`: `Id`, `Username`, `PasswordHash`, `PasswordSalt`, `City?`, `Country?`, `KnownAs?`

## API Summary
Auth
- `POST /Auth/register`: create account, returns JWT
- `POST /Auth/login`: authenticate, returns JWT

Users
- `GET /Users`: list users (authorized)
- `GET /Users/{id}`: user by id (authorized)
- `GET /Users/me`: current user profile (authorized)
- `DELETE /Users/{id}`: delete user (admin only)

Categories
- `GET /Categories`: list categories (per user)
- `GET /Categories/{id}`: category by id
- `POST /Categories`: create category
- `DELETE /Categories/{id}`: delete category

Pins
- `GET /Pins`: filter + paginate via `title`, `visitedFrom`, `createdFrom`, `category`, `page`, `pageSize`
- `GET /Pins/count`: total matches for current filters
- `GET /Pins/{id}`: details
- `POST /Pins`: create (multipart form, optional photo upload)
- `DELETE /Pins/{id}`: delete

Trips
- `GET /Trips`: filter + paginate via `title`, `dateFrom`, `dateTo`, `page`, `pageSize`
- `GET /Trips/count`: total matches for current filters
- `GET /Trips/{id}`: details (pins + photos)
- `GET /Trips/{id}/access`: current user’s access
- `POST /Trips`: create (multipart form, multiple photos, pin associations)
- `PUT /Trips/{id}`: update (multipart form, optimistic concurrency via `RowVersion`)
- `DELETE /Trips/{id}`: delete (photo cleanup; requires `rowVersion` query param)

### Pagination Model
- Server defaults: `page=1`, `pageSize=50` if omitted.
- Use `/count` endpoints to compute `totalPages` accurately on the client.

### Implementation & Examples
Backend
- Filtering: apply title/date/category conditions; for trips, `dateFrom` ≤ `dateTo` when both present.
- Pagination: `Skip((page-1)*pageSize).Take(pageSize)`; defaults `page=1`, `pageSize=50`.
- Count: `/Pins/count` and `/Trips/count` return `{ count }` for current filters.

Frontend
- Services: pass query params (`title`, `dateFrom`, `dateTo`, `visitedFrom`, `createdFrom`, `category`, `page`, `pageSize`).
- Hooks: expose `fetch*` + `*Count`; compute `totalPages = ceil(count / pageSize)`.
- Components: render current page results and enable next/prev controls.

Examples (Trips):
```http
GET /Trips?title=Summer&dateFrom=2025-06-01&page=2&pageSize=12
```
```http
GET /Trips/count?title=Summer&dateFrom=2025-06-01
```

Minimal JSON responses:
```json
// GET /Trips/count
{ "count": 24 }
```
```json
// GET /Trips
[
	{ "id": 101, "title": "Summer Coast", "dateFrom": "2025-06-01", "dateVisited": "2025-06-15", "photos": [{ "id": 1, "url": "..." }] },
	{ "id": 102, "title": "Mountain Trek", "dateFrom": "2025-07-05", "dateVisited": "2025-07-20", "photos": [] }
]
```

Examples (Pins):
```http
GET /Pins?title=Beach&visitedFrom=2025-06-01&category=Nature&page=1&pageSize=12
```
```http
GET /Pins/count?title=Beach&visitedFrom=2025-06-01&category=Nature
```
```json
// GET /Pins
[
	{ "id": 501, "title": "Hidden Beach", "latitude": 12.34, "longitude": 56.78, "category": { "name": "Nature" }, "photos": [{ "id": 7, "url": "..." }] }
]
```

## Setup
Backend (API)
```powershell
cd TripMapperBE/TripMapperBAL
dotnet restore
dotnet run
```

Frontend (React)
```bash
cd tripmapperfe
npm install
npm start
```

## Configuration
Edit [TripMapperBE/TripMapperBAL/appsettings.json](TripMapperBE/TripMapperBAL/appsettings.json) for DB, JWT, and Backblaze credentials. Create TripMapperDB database in SQL Server with the correct entities. CORS allows `http://localhost:3000` by default (see [Program.cs](TripMapperBE/TripMapperBAL/Program.cs)).

## Security
- Controllers use `[Authorize]`; JWT settings are in `appsettings.json`.
- Trip access is enforced in services through `TripAccess` checks.
- Updates/deletes use `RowVersion` to prevent overwriting concurrent changes.

## Key Paths
- Backend solution: [TripMapperBE](TripMapperBE) · Frontend app: [tripmapperfe](tripmapperfe)

## License
See [LICENSE.txt](LICENSE.txt).

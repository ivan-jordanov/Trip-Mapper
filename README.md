# TripMapper

TripMapper is a full-stack web application built for mapping travel itineraries, placing geo-located pins, and sharing trip logs in real time. Built with ASP.NET Core and React, it allows users to visually document trips on interactive maps, attach photos to specific locations, and collaborate securely with friends.

## Overview
- **Interactive Trip & Pin Mapping:** The primary core of TripMapper. Create trips and plot precise geographical locations using latitude and longitude coordinates, custom categories, visit dates, and rich notes.
- **Photo Journaling & Cloud Storage:** Attach multiple photos directly to individual pins or entire trip overviews, fully integrated with Backblaze B2 storage and automatic database cleanup upon removal.
- **Search & Spatial Filtering:** Perform server-side filtering across pins (by title, category, visited date, or creation date) and trips (by date range or title), complete with `/count` endpoints for accurate pagination.
- **Trip Sharing & Access Control:** Share trip maps with designated users using granular access levels (`Owner` vs. `View` permission models).
- **Real-Time Collaborator Presence:** SignalR-powered WebSocket hub tracks when collaborators viewing or editing shared trips are currently online across multi-tab sessions.
- **Social Friends Network:** Send, accept, or decline friend requests to build a verified friends list, controlling who can be added as a trip collaborator.
- **Optimistic Concurrency:** Protect trip data from race conditions or accidental overwrites using `RowVersion` concurrency checks.

## Tech Stack
- **Backend:** ASP.NET Core Web API, SignalR (WebSockets), Entity Framework Core (SQL Server), AutoMapper
- **Data Access:** Repository and Unit of Work patterns
- **Auth & Security:** JWT Bearer Authentication, claims-based `[Authorize]` routing, optimistic concurrency
- **Frontend:** React, TanStack Query (React Query), `@microsoft/signalr`, Mantine UI, Axios, Tabler Icons
- **Cloud Storage:** Backblaze B2 (configurable via `appsettings.json`)

---

## Data Model
- **`Trip`**: `Id`, `Title`, `Description`, `DateFrom?`, `DateVisited?`, `RowVersion`, `Photos[]`, `Pins[]`, `TripAccesses[]`
- **`Pin`**: `Id`, `Title`, `Description`, `Latitude`, `Longitude`, `DateVisited?`, `CreatedAt?`, `Category?`, `TripId?`, `Photos[]`, `UserId`
- **`Photo`**: `Id`, `Url`, `FileName`, `PinId?`, `TripId?`
- **`Category`**: `Id`, `Name`, `ColorCode?`, `IsDefault?`, `UserId`, `RowVersion`
- **`TripAccess`**: `TripId`, `UserId`, `AccessLevel` (`Owner` | `View`)
- **`User`**: `Id`, `Username`, `PasswordHash`, `PasswordSalt`, `City?`, `Country?`, `KnownAs?`, `SentFriendRequests[]`, `ReceivedFriendRequests[]`
- **`FriendRequest`**: `Id`, `RequesterId`, `AddresseeId`, `Status` (`Pending` | `Accepted` | `Declined`), `CreatedAt`, `RespondedAt?`

---

## API & WebSocket Endpoints

### Trips & Itineraries
- `POST /Trips`: Create trip (supports multipart uploads for trip photos and pin associations)
- `GET /Trips`: Filter and paginate trips (`title`, `dateFrom`, `dateTo`, `page`, `pageSize`)
- `GET /Trips/count`: Fetch total matches for active trip filters
- `GET /Trips/{id}`: Get full trip details with all associated pins, categories, and photos
- `GET /Trips/{id}/access`: Check current user's access level for a trip
- `PUT /Trips/{id}`: Update trip details (requires `RowVersion` token for concurrency)
- `DELETE /Trips/{id}`: Delete trip and purge all connected cloud storage photos

### Pins & Locations
- `POST /Pins`: Create a new geo-located pin with latitude, longitude, category, and optional photo
- `GET /Pins`: Filter and paginate pins (`title`, `visitedFrom`, `createdFrom`, `category`, `page`, `pageSize`)
- `GET /Pins/count`: Fetch total matches for active pin filters
- `GET /Pins/{id}`: Get pin details and attached photos
- `DELETE /Pins/{id}`: Delete a pin and its associated photos

### Categories
- `GET /Categories`: List default and custom user categories
- `GET /Categories/{id}`: Fetch category details
- `POST /Categories`: Create custom category with custom color coding
- `DELETE /Categories/{id}`: Delete category

### Real-Time Presence (SignalR)
- `WS /hubs/presence`: WebSocket endpoint managing online presence:
  - Tracks connection state per user across active tabs and devices.
  - Broadcasts `UserIsOnline` and `UserIsOffline` events strictly to shared trip collaborators.

### Friends & Social
- `POST /Friends/requests`: Send a friend request by username
- `GET /Friends/requests?direction=incoming|outgoing`: List pending incoming or outgoing requests
- `POST /Friends/requests/{id}/accept`: Accept a pending request
- `POST /Friends/requests/{id}/decline`: Decline a pending request
- `GET /Friends`: List all confirmed friends
- `DELETE /Friends/{userId}`: Remove a user from your friends list

### Auth
- `POST /Auth/register`: Create account and return JWT
- `POST /Auth/login`: Authenticate and return JWT

---

## Setup

### Prerequisites
- .NET 8.0 SDK
- Node.js (v18+)
- SQL Server

### Backend (API)
```powershell
cd TripMapperBE/TripMapperBAL
dotnet restore
dotnet run
```

### Frontend (React)
```bash
cd tripmapperfe
npm install
npm start
```

---

## Configuration & Security
- **AppSettings:** Update `appsettings.json` with your SQL Server connection string, JWT secret keys, and Backblaze B2 credentials.
- **Authorization:** Controller endpoints are protected via `[Authorize]`. Trip access and pin modifications are validated dynamically at the service layer through `TripAccess` records.

---

## Visuals
![App Screenshot 1](https://i.imgur.com/vy0NwXh.png)
![App Screenshot 2](https://i.imgur.com/YZKoIUS.png)
![App Screenshot 3](https://i.imgur.com/N86Kc73.png)
![App Screenshot 4](https://i.imgur.com/ho1ipld.png)

## License
See [LICENSE.txt](LICENSE.txt).
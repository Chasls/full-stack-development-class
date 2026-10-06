# Travlr Angular administration

See the parent `../README.md` for installation, database setup, REST endpoints, testing, and submission evidence.

- `npm start`: Angular development server with the Express proxy on port 4200.
- `npm run build`: production SPA mounted by Express at `/admin/`.
- `npm test -- --watch=false`: component and HTTP service tests using mock trips.

The source contains a Trip model, TripDataService, TripListComponent, TripCardComponent, and a shared add/edit TripFormComponent.

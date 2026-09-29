# Travlr Getaways - Module Five

This Express application separates the customer-facing MVC website from the REST API. The `app_server` controller requests trip JSON from the `/api` endpoints, while the top-level `app_api` application uses Mongoose to retrieve trip records from MongoDB. The included `data/trips.json` file contains the three sample trip records.

## Requirements

- Node.js 18 or later
- MongoDB running locally on `127.0.0.1:27017`

To use another database, set `MONGODB_URI` to a MongoDB connection string before running the app, seed script, or inspection script.

## Install, seed, and run

From this `travlr` folder:

```text
npm install
npm run seed
npm run inspect
npm start
```

On Windows PowerShell, use `npm.cmd` in place of `npm` if script execution is blocked.

Open `http://localhost:3000/travel` to view the travel page. The MVC controller populates this page with JSON requested from the REST API.

The REST endpoints are:

- `GET /api/trips` - returns the complete trip collection
- `GET /api/trips/:tripCode` - returns the trip matching the requested code

For example, `GET /api/trips/GALE-REEF` returns Gale Reef. A missing code returns HTTP 404 with a JSON error response. Unexpected database errors return HTTP 500 with a JSON error response.

The seed command validates each entry in `trips.json` and inserts or updates trips by code. Running it again updates the same three records without creating duplicates. It does not remove other trips already in the collection.

## Verify

`npm run inspect` reads the MongoDB collection directly and checks every seed field, including that `start` is stored as a MongoDB date.

`npm test` runs the automated application tests against an isolated temporary MongoDB database. The tests verify schema validation, seeding, collection and individual API requests, JSON response types, HTTP 404 handling, the MVC-to-API data flow, static assets, and database updates. The test database is removed after the run.

Import `test/Travlr_API.postman_collection.json` into Postman while the application is running to execute the supplied collection, individual-trip, and missing-trip requests and their response tests.

## Project layout

```text
travlr/
  app.js                                   Express application and route mounting
  server.js                                Database connection and server startup
  app_api/controllers/trips.js             REST endpoint controller methods
  app_api/models/db.js                     Mongoose connection and error handling
  app_api/models/travlr.js                 Trip schema and model
  app_api/models/seed.js                   Sample-data loader
  app_api/models/inspect.js                Direct database verification
  app_api/routes/index.js                  REST API routes
  app_server/controllers/travel.js         MVC controller that consumes the API
  app_server/routes/index.js               Customer-facing MVC routes
  data/trips.json                          Sample trip data
  public/                                  Static website pages and assets
  test/app.test.js                         Automated integration tests
  test/Travlr_API.postman_collection.json  Postman requests and tests
```

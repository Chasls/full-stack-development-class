# Travlr Getaways — Module Four

This Express application stores trip information in MongoDB with Mongoose. The travel page and JSON trip endpoints read from the `travlr.trips` collection. The included `data/trips.json` file is the source for the three sample trip records.

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

Open `http://localhost:3000/travel` to view the database-backed travel page. `GET /api/trips` returns every trip as JSON, and `GET /api/trips/GALE-REEF` returns one trip by its code. A missing code returns HTTP 404 with a JSON error.

The seed command validates each entry in `trips.json` and inserts or updates trips by code. Running it again updates the same three records without creating duplicates. It does not remove other trips already in the collection.

## Verify

`npm run inspect` reads the MongoDB collection directly and prints its name, document count, and stored JSON. It checks every seed field, including that `start` is stored as a MongoDB date. The expected clean database has three documents.

`npm test` runs 13 checks against an isolated temporary MongoDB database. The tests verify schema validation, seeding, database records, live database updates on the HTML page and JSON routes, static assets, and HTTP error responses. The test database is removed after the run.

Local verification completed with three documents in `travlr.trips`, 13 passing tests, and HTTP 200 responses from both `/travel` and `/api/trips`.

## Project layout

```text
travlr/
  app.js                           Express app and routes
  server.js                        Database connection and server startup
  app_server/controllers/travel.js Database-backed travel page
  app_server/models/db.js          Mongoose connection and error handling
  app_server/models/travlr.js      Trip schema and model
  app_server/models/seed.js        Sample-data loader
  app_server/models/inspect.js     Direct database verification
  app_server/routes/api.js         JSON trip routes
  data/trips.json                  Sample trip data
  public/                          Static website pages and assets
  test/app.test.js                 Application and database tests
```

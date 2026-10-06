# Travlr Getaways - Module Six

The customer website uses Express and Handlebars, the trip API uses Mongoose and MongoDB, and the Angular admin SPA uses reusable trip list/card components, reactive add/edit forms, and a shared HTTP data service. Bootstrap CSS supplies responsive cards and forms.

## Install and run

Requirements: Node.js 22.12 or later and MongoDB on `127.0.0.1:27017`. Set `MONGODB_URI` to use a different database. Run these commands from the `travlr` folder (use `npm.cmd` on Windows when needed):

```text
npm ci
npm --prefix app_admin ci
npm run seed
npm run seed:module6
npm run build:admin
npm start
```

Open `http://localhost:3000/admin/` to administer trips and `http://localhost:3000/travel` to view the public website. The production Angular build is included in the submission ZIP. The standard seed loads three original trips; `seed:module6` additionally restores the fourth trip shown in the screenshots. Neither seed removes other trips.

For Angular development, keep Express running and use `npm --prefix app_admin start` in another terminal. Open `http://localhost:4200`. The development proxy forwards API, image, and public travel requests to Express.

## REST endpoints

| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | `/api/trips` | Retrieve trips sorted by name |
| GET | `/api/trips/:tripCode` | Retrieve one trip |
| POST | `/api/trips` | Create a trip, returning 201 |
| PUT | `/api/trips/:tripCode` | Replace editable trip values, returning 200 |
| DELETE | `/api/trips/:tripCode` | Delete a trip, returning 204 |

Every trip includes code, name, length, start, resort, perPerson, image, and description. Codes stay fixed after creation. Invalid input returns 400, duplicate codes return 409, missing trips return 404, and database failures return 500. Descriptions accept plain text or p, strong, em, and br tags without attributes.

## Verification

```text
npm test
npm run test:admin
```

Backend tests use an isolated temporary MongoDB database and remove it afterward. They cover CRUD persistence, validation, duplicates, missing trips, customer page rendering, and static resources. Angular tests use mock trips and HTTP responses to verify cards, deletion confirmation, add/edit forms, error handling, and each HTTP method.

Import `test/Travlr_API.postman_collection.json` into Postman, set `baseUrl`, and run the collection with Express running. The collection creates, updates, and deletes its own `POSTMAN-CRUD-TEST` record. It was verified using Newman's Postman collection runner (11 requests, 19 assertions).

`node app_admin/e2e/browser-check.cjs` runs the Chrome browser workflow with Playwright against the running server. It requires a database without `ISLAND-ESCAPE`, adds the screenshot trip through Angular, updates it, verifies MongoDB and the public website, checks deletion using a temporary record, and captures screenshots. It intentionally retains `ISLAND-ESCAPE` afterward. Use a separate empty database and seed only the original trips before rerunning this demonstration. Chrome must be installed.

## Submission evidence

The three required screenshots show a fourth trip added through Angular, its loaded edit form, and the saved update with a success message. The trip changes from Island Escape at $1,399 to Island Escape Adventure at $1,499. Additional images show mobile cards and the public website. The `module6` branch contains the local implementation.

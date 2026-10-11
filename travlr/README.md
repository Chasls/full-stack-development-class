# Travlr Getaways Final Project

Travlr uses Express, Handlebars, MongoDB, and an Angular administrator SPA. Customers can search packages, create an account, log in, book trips, view their itinerary, and cancel reservations. Administrators can add, edit, and delete trips, maintain package prices, and update or delete customer accounts.

## Setup

Use Node.js 22.12 or later and MongoDB. Run from the travlr folder:

```text
npm ci
npm --prefix app_admin ci
npm run seed:demo
npm run build:admin
npm start
```

The ZIP includes the production Angular build. The demo seed loads three original course trips plus Island Escape Adventure. It updates those codes without removing unrelated records. MONGODB_URI defaults to mongodb://127.0.0.1:27017/travlr. The standard `npm run seed` loads only the three original trips.

Customer website: http://localhost:3000/travel
Customer accounts: http://localhost:3000/account
Customer itinerary: http://localhost:3000/itinerary
Administrator SPA: http://localhost:3000/admin/

Create a local administrator before signing in. In PowerShell, choose your own values:

```powershell
$env:ADMIN_EMAIL = 'your-email@example.com'
$env:ADMIN_PASSWORD = 'choose-your-own-password-at-least-12-characters'
npm run create:admin
$env:ADMIN_PASSWORD = $null
```

ADMIN_NAME is optional. The command refuses to overwrite or promote an existing account. Public registration always creates regular users. Set JWT_SECRET to a private random value of at least 32 bytes for a persistent signing key. Production requires it. Development generates a temporary key when omitted; server restart invalidates old tokens.

## Application structure

app_server contains the public MVC routes, controllers, and Handlebars views. app_api contains REST routes, controllers, Mongoose models, and token middleware. app_admin/src/app contains Angular components, reactive forms, routing, authentication, and the shared trip data service. public contains the supplied website pages, images, CSS, and customer account script. MongoDB stores trips, users, and reservations.

## API

| Method | Endpoint | Access |
| --- | --- | --- |
| GET | /api/trips | Public trip collection |
| GET | /api/trips/:tripCode | Public trip detail |
| POST | /api/trips | Administrator creates trip |
| PUT | /api/trips/:tripCode | Administrator edits trip |
| DELETE | /api/trips/:tripCode | Administrator removes trip |
| POST | /api/register | Public regular-user registration |
| POST | /api/login | Public credential validation |
| GET | /api/reservations | Authenticated customer's itinerary |
| POST | /api/reservations | Customer books using tripCode |
| DELETE | /api/reservations/:id | Customer cancels own reservation |
| GET | /api/users | Administrator lists customers |
| PUT | /api/users/:id | Administrator edits customer name/email |
| DELETE | /api/users/:id | Administrator removes customer and reservations |

Passwords are stored as scrypt hashes with random salts. Tokens expire after one hour. API middleware checks signature, expiry, issuer, audience, and the current account. Client routes and controls provide additional interface restrictions. Reservation ownership comes from the verified account, never a submitted user ID. Customer management never exposes salts or password hashes and cannot modify administrator accounts.

Reservations preserve a trip snapshot so later package changes do not rewrite booked itineraries. Cancellation retains the record with cancelled status. Each customer can reserve a given trip code once. Rebooking a cancelled package, seat inventory, payments, and outside travel-provider integration are beyond this implementation.

## Verification

```text
npm test
npm run test:admin
npm run test:browser
```

Results: 23 backend tests, 16 Angular tests, 31 Postman requests with 45 assertions, and the complete Chrome browser workflow passed. Backend and browser tests use isolated temporary databases and remove them afterward. The browser script starts its own server on port 3107, runs the Postman collection through Newman, and checks customer and administrator workflows. Chrome is required; npx obtains Newman when needed. Evidence is in test/evidence/final-project.

To run directly in Postman, import test/Travlr_API.postman_collection.json and set baseUrl, adminEmail, and adminPassword. Run it in order against a test database. The collection deletes its temporary trip and customer after verification. API responses use 400 for invalid input, 401 for invalid authentication, 403 for unauthorized roles, 404 for missing resources, and 409 for duplicates.

For development, run Express and `npm --prefix app_admin start` in separate terminals, then open http://localhost:4200. The proxy forwards API, image, and public travel requests to Express.

## Deployment considerations

Use HTTPS, login rate limiting, and managed secrets for production. Tokens are stored in session storage. Client logout removes the local token; a copied token remains valid until expiry unless the account is removed or demoted. Deleting a customer and their reservations uses separate database operations rather than a multi-document transaction.

Implementation references: [Node.js crypto](https://nodejs.org/api/crypto.html) and [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken).

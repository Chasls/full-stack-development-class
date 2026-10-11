# Travlr Getaways - Module Seven

The Angular admin site now requires an administrator login to add, edit, or delete trips. Visitors can still view the trip listings. The API independently verifies authorization for every write.

## Setup

Use Node.js 22.12 or later and MongoDB. From the travlr folder, run:

```text
npm ci
npm --prefix app_admin ci
npm run seed
npm run build:admin
npm start
```

Open http://localhost:3000/admin/ or http://localhost:3000/travel. The ZIP includes the compiled admin site. MONGODB_URI defaults to mongodb://127.0.0.1:27017/travlr.

Set ADMIN_EMAIL and ADMIN_PASSWORD in the terminal environment, then run `npm run create:admin`. Choose your own email and password of 12 to 128 characters. ADMIN_NAME is optional. The command refuses to overwrite or promote an existing account. Clear the password variable afterward. Public registration always creates regular users.

Set JWT_SECRET to a private random value of at least 32 bytes for a persistent signing key. Production requires this setting. Development generates a temporary key when it is omitted, so restarting invalidates tokens.

## Security

Passwords are stored as scrypt hashes with separate random salts. Tokens expire after one hour. The API validates their signature, expiration, issuer, and audience, then checks the current database account and administrator role. Deleting or demoting an account removes its write access immediately.

Angular uses session storage, guarded add/edit routes, conditional CRUD controls, and an HTTP interceptor that attaches the bearer token to trip writes. Logout clears the token. Invalid sessions redirect to login, and expiration hides administrative controls.

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | /api/register | Public; regular-user registration |
| POST | /api/login | Public; credential validation |
| GET | /api/trips | Public |
| GET | /api/trips/:tripCode | Public |
| POST | /api/trips | Administrator |
| PUT | /api/trips/:tripCode | Administrator |
| DELETE | /api/trips/:tripCode | Administrator |

Missing or invalid tokens return 401. Regular users receive 403 on trip writes. Existing trip validation remains in place.

## Tests

```text
npm test
npm run test:admin
node app_admin/e2e/module7-check.cjs
```

All 20 backend tests and 14 Angular tests passed. Newman ran the Postman collection successfully: 23 requests and 32 assertions. The Chrome workflow passed login, CRUD, logout, guarded URLs, expired sessions, and mobile layout checks.

Backend tests use temporary MongoDB databases. The browser script starts a test server on port 3107, runs Newman, and checks the Angular workflow in Chrome. It removes its temporary database and stops the server afterward. Chrome is required. Newman is obtained through npx when needed.

Import test/Travlr_API.postman_collection.json into Postman and set baseUrl, adminEmail, and adminPassword to match your test server. Run the requests in order. The collection creates a regular user and removes its temporary trip. Run against a test database, since the mock user remains on a persistent database.

Screenshots and machine-readable results are in test/evidence/module7. Postman results were generated with Newman, the Postman collection runner.

## References and deployment

- [Node.js crypto documentation](https://nodejs.org/api/crypto.html)
- [jsonwebtoken documentation](https://github.com/auth0/node-jsonwebtoken)

The assignment's single authentication layer is implemented. A production deployment should add HTTPS, login rate limiting, and managed secrets. Client logout removes the local token; a copied token remains valid until expiry unless its account is removed or demoted.

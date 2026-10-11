'use strict';

const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
process.env.JWT_SECRET = 'module-seven-isolated-test-secret-2026';
const app = require('../app');
const { connect, disconnect, mongoose } = require('../app_api/models/db');
const { seedTrips } = require('../app_api/models/seed');
const Trip = require('../app_api/models/travlr');

const tripsPath = path.join(__dirname, '..', 'data', 'trips.json');
const trips = JSON.parse(fs.readFileSync(tripsPath, 'utf8'));

const User = require('../app_api/models/user');
const {tokenFor} = require('../app_api/security');
let adminToken;
let baseUrl;
let server;
const pages = [
  'about.html',
  'contact.html',
  'index.html',
  'meals.html',
  'news.html',
  'rooms.html',
  'travel.html'
];

before(async () => {
  await connect(`mongodb://127.0.0.1:27017/travlr_test_${process.pid}_${Date.now()}`);
  await seedTrips();
  const admin = new User({name: 'Mock Admin', email: 'admin@example.test', role: 'admin'});
  await admin.setPassword('Mock-password-2026!'); await admin.save(); adminToken = tokenFor(admin);

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
  }
  await disconnect();
});

test('Express serves the Travlr home page', async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/html/);
  assert.match(body, /<title>Travlr Getaways Website Template<\/title>/);
});

test('Express serves every supplied HTML page', async () => {
  for (const page of pages) {
    const response = await fetch(`${baseUrl}/${page}`);
    assert.equal(response.status, 200, `${page} should be available`);
    assert.match(response.headers.get('content-type'), /^text\/html/);
  }
});

test('Every local page link and image resolves through Express', async () => {
  for (const page of pages) {
    const pageUrl = `${baseUrl}/${page}`;
    const html = await (await fetch(pageUrl)).text();
    const references = [...html.matchAll(/(?:href|src)=["']([^"'#]+)["']/g)]
      .map((match) => match[1])
      .filter((reference) => !/^(?:https?:|mailto:|tel:|data:)/i.test(reference));

    for (const reference of references) {
      const assetUrl = new URL(reference, pageUrl);
      const response = await fetch(assetUrl);
      assert.equal(
        response.status,
        200,
        `${page} links to unavailable resource ${reference}`
      );
    }
  }
});

test('Every stylesheet image resolves through Express', async () => {
  const stylesheetUrl = `${baseUrl}/css/style.css`;
  const css = await (await fetch(stylesheetUrl)).text();
  const references = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)]
    .map((match) => match[1]);

  for (const reference of references) {
    const assetUrl = new URL(reference, stylesheetUrl);
    const response = await fetch(assetUrl);
    assert.equal(
      response.status,
      200,
      `style.css links to unavailable resource ${reference}`
    );
  }
});

test('Express serves the website stylesheet', async () => {
  const response = await fetch(`${baseUrl}/css/style.css`);

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/css/);
});

test('MVC travel route renders JSON retrieved from the REST API', async () => {
  const response = await fetch(`${baseUrl}/travel`);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/html/);
  assert.match(body, /<title>Travel - Travlr Getaways<\/title>/);
  assert.doesNotMatch(body, /{{[#/]?each|{{title}}/);

  const decodedBody = body.replaceAll('&#x27;', "'");

  for (const trip of trips) {
    const escapedName = trip.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameOccurrences = decodedBody.match(new RegExp(escapedName, 'g')) || [];

    assert.match(body, new RegExp(`/images/${trip.image}`));
    assert.ok(
      body.includes(trip.description),
      `${trip.name} description should be rendered from trips.json as HTML`
    );
    assert.ok(
      nameOccurrences.length >= 2,
      `${trip.name} should appear in both the heading and JSON description`
    );
  }
});

test('Trip schema rejects records without required fields', async () => {
  const invalid = new Trip({ code: 'INCOMPLETE', name: 'Incomplete trip' });
  await assert.rejects(invalid.validate(), (error) => {
    assert.equal(error.name, 'ValidationError');
    assert.ok(error.errors.start);
    assert.ok(error.errors.image);
    return true;
  });
});

test('Seed data is stored as three typed MongoDB documents', async () => {
  const collection = mongoose.connection.db.collection('trips');
  const stored = await collection.find({}).toArray();

  assert.equal(await collection.countDocuments(), trips.length);
  for (const expected of trips) {
    const actual = stored.find((trip) => trip.code === expected.code);
    assert.ok(actual, `${expected.code} should be in MongoDB`);
    assert.equal(actual.name, expected.name);
    assert.equal(actual.image, expected.image);
    assert.ok(actual.start instanceof Date);
    assert.equal(actual.start.toISOString(), expected.start);
  }

  await seedTrips();
  assert.equal(await collection.countDocuments(), trips.length);
});

test('Trip API returns seeded documents as JSON', async () => {
  const response = await fetch(`${baseUrl}/api/trips`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  assert.equal(body.length, trips.length);
  for (const expected of trips) {
    const actual = body.find((trip) => trip.code === expected.code);
    assert.ok(actual, `${expected.code} should be returned by the API`);
    assert.equal(actual.name, expected.name);
    assert.equal(actual.start, expected.start);
  }
});

test('Trip API collection is sorted by trip name', async () => {
  const response = await fetch(`${baseUrl}/api/trips`);
  const body = await response.json();
  const names = body.map((trip) => trip.name);

  assert.equal(response.status, 200);
  assert.deepEqual(names, [...names].sort((left, right) => left.localeCompare(right)));
});

test('Trip API retrieves a single trip and reports missing codes', async () => {
  const response = await fetch(`${baseUrl}/api/trips/${trips[0].code}`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json/);
  assert.equal((await response.json()).name, trips[0].name);

  const missing = await fetch(`${baseUrl}/api/trips/NO-SUCH-TRIP`);
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'Trip not found' });
});

test('Travel page and API reflect a change made directly in MongoDB', async () => {
  const code = trips[0].code;
  const changedName = 'Gale Reef Database Update';
  await Trip.updateOne({ code }, { $set: { name: changedName } });

  try {
    const apiResponse = await fetch(`${baseUrl}/api/trips/${code}`);
    assert.equal((await apiResponse.json()).name, changedName);

    const pageResponse = await fetch(`${baseUrl}/travel`);
    assert.match(await pageResponse.text(), /Gale Reef Database Update/);
  } finally {
    await Trip.updateOne({ code }, { $set: { name: trips[0].name } });
  }
});

test('Express exposes a diagnostic endpoint', async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ok',
    application: 'travlr'
  });
});

test('CRUD API persists additions and updates, renders them publicly, and deletes them', async () => {
  const trip = { ...trips[0], code: 'CRUD-TEST', name: 'CRUD Test Getaway' };
  const url = `${baseUrl}/api/trips/${trip.code}`;
  const options = body => ({ headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` }, body: JSON.stringify(body) });
  try {
    const added = await fetch(`${baseUrl}/api/trips`, { method: 'POST', ...options(trip) });
    assert.equal(added.status, 201);
    assert.equal((await added.json()).name, trip.name);
    assert.ok(await Trip.findOne({ code: trip.code }));
    assert.match(await (await fetch(`${baseUrl}/travel`)).text(), /CRUD Test Getaway/);
    assert.equal((await fetch(`${baseUrl}/api/trips`, { method: 'POST', ...options(trip) })).status, 409);
    trip.name = 'Updated CRUD Getaway';
    const updated = await fetch(url, { method: 'PUT', ...options(trip) });
    assert.equal(updated.status, 200);
    assert.equal((await updated.json()).name, trip.name);
    assert.equal((await Trip.findOne({ code: trip.code })).name, trip.name);
    assert.match(await (await fetch(`${baseUrl}/travel`)).text(), /Updated CRUD Getaway/);
    assert.equal((await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } })).status, 204);
    assert.equal(await Trip.findOne({ code: trip.code }), null);
    assert.equal((await fetch(url)).status, 404);
    assert.equal((await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } })).status, 404);
    assert.equal((await fetch(url, { method: 'PUT', ...options(trip) })).status, 404);
  } finally { await Trip.deleteOne({ code: trip.code }); }
});

test('CRUD API rejects missing values, invalid dates, code changes, and unsafe descriptions', async () => {
  const options = body => ({ headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` }, body: JSON.stringify(body) });
  for (const body of [{}, { ...trips[0], code: 'BAD-DATE', start: 'not-a-date' },
    { ...trips[0], code: 'BAD-HTML', description: '<script>alert(1)</script>' }]) {
    assert.equal((await fetch(`${baseUrl}/api/trips`, { method: 'POST', ...options(body) })).status, 400);
  }
  const response = await fetch(`${baseUrl}/api/trips/${trips[0].code}`,
    { method: 'PUT', ...options({ ...trips[0], code: 'CHANGED-CODE' }) });
  assert.equal(response.status, 400);
  assert.ok(await Trip.findOne({ code: trips[0].code }));
});

test('Express returns 404 for an unknown path', async () => {
  const response = await fetch(`${baseUrl}/missing-page`);

  assert.equal(response.status, 404);
  assert.equal(await response.text(), 'Not Found');
});


test('Registration stores salted hashes and cannot grant admin access', async () => {
 const values = {name: 'Mock User', email: 'user@example.test', password: 'Mock-password-2026!', role: 'admin'};
 const options = {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(values)};
 const response = await fetch(`${baseUrl}/api/register`, options);
 assert.equal(response.status, 201);
 const {token} = await response.json();
 assert.equal(typeof token, 'string');
 const stored = await User.findOne({email: values.email}).select('+salt +hash').lean();
 assert.equal(stored.role, 'user'); assert.notEqual(stored.hash, values.password); assert.equal(stored.salt.length, 32);
 assert.equal((await fetch(`${baseUrl}/api/register`, options)).status, 409);
 const denied = await fetch(`${baseUrl}/api/trips`, {method: 'POST', headers: {Authorization: `Bearer ${token}`}});
 assert.equal(denied.status, 403);
 const login = await fetch(`${baseUrl}/api/login`, {...options, body: JSON.stringify({email: values.email, password: values.password})});
 assert.equal(login.status, 200);
});

test('Login accepts an administrator and rejects wrong or missing credentials', async () => {
 for (const [body, expected] of [
  [{email: 'admin@example.test', password: 'Mock-password-2026!'}, 200],
  [{email: 'admin@example.test', password: 'wrong'}, 401],
  [{email: 'missing@example.test', password: 'wrong'}, 401], [{}, 400],
  [{email: {$ne: null}, password: 'wrong'}, 400]]) {
  const response = await fetch(`${baseUrl}/api/login`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
  assert.equal(response.status, expected);
  if (expected === 200) assert.equal(typeof (await response.json()).token, 'string');
 }
});

test('Every write endpoint rejects absent, malformed, tampered, and expired tokens', async () => {
 const jwt = require('jsonwebtoken');
 const expired = jwt.sign({role: 'admin'}, process.env.JWT_SECRET || 'incorrect-secret', {expiresIn: -1, issuer: 'travlr', audience: 'travlr-admin'});
 const headers = [undefined, 'Basic secret', 'Bearer garbage', `Bearer ${adminToken.slice(0, -8)}tampered`, `Bearer ${expired}`];
 for (const method of ['POST', 'PUT', 'DELETE']) {
  const url = `${baseUrl}/api/trips${method === 'POST' ? '' : '/' + trips[0].code}`;
  for (const header of headers) {
   const response = await fetch(url, {method, headers: header ? {Authorization: header} : {}});
   assert.equal(response.status, 401, `${method} must reject ${header || 'missing token'}`);
  }
 }
 assert.equal(await Trip.countDocuments(), trips.length);
});

test('Deleted and demoted administrators lose write access', async () => {
 const user = new User({name: 'Temporary Admin', email: 'temporary@example.test', role: 'admin'});
 await user.setPassword('Temporary-password!'); await user.save();
 const token = tokenFor(user);
 await User.updateOne({_id: user._id}, {$set: {role: 'user'}});
 const options = {method: 'DELETE', headers: {Authorization: `Bearer ${token}`}};
 assert.equal((await fetch(`${baseUrl}/api/trips/${trips[0].code}`, options)).status, 403);
 await User.deleteOne({_id: user._id});
 assert.equal((await fetch(`${baseUrl}/api/trips/${trips[0].code}`, options)).status, 401);
});

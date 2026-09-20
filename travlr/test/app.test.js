'use strict';

const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../app');
const { connect, disconnect, mongoose } = require('../app_server/models/db');
const { seedTrips } = require('../app_server/models/seed');
const Trip = require('../app_server/models/travlr');

const tripsPath = path.join(__dirname, '..', 'data', 'trips.json');
const trips = JSON.parse(fs.readFileSync(tripsPath, 'utf8'));

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

test('Travel route renders controller data with Handlebars', async () => {
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

test('Trip API retrieves a single trip and reports missing codes', async () => {
  const response = await fetch(`${baseUrl}/api/trips/${trips[0].code}`);
  assert.equal(response.status, 200);
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

test('Express returns 404 for an unknown path', async () => {
  const response = await fetch(`${baseUrl}/missing-page`);

  assert.equal(response.status, 404);
  assert.equal(await response.text(), 'Not Found');
});

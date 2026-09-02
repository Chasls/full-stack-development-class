'use strict';

const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const app = require('../app');

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
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
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

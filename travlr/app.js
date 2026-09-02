'use strict';

const express = require('express');
const path = require('node:path');

const app = express();
const publicDirectory = path.join(__dirname, 'public');

app.disable('x-powered-by');

// Serve the supplied customer-facing HTML, styles, and images from the
// conventional Express public directory.
app.use(express.static(publicDirectory));

// A small diagnostic endpoint makes it easy to confirm that Express is live.
app.get('/health', (_request, response) => {
  response.json({ status: 'ok', application: 'travlr' });
});

app.use((_request, response) => {
  response.status(404).type('text').send('Not Found');
});

module.exports = app;

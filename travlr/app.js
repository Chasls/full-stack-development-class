'use strict';

const express = require('express');
const hbs = require('hbs');
const path = require('node:path');
const travelerRouter = require('./app_server/routes/index');
const apiRouter = require('./app_api/routes/index');

const app = express();
const publicDirectory = path.join(__dirname, 'public');
const viewsDirectory = path.join(__dirname, 'app_server', 'views');

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.set('views', viewsDirectory);
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(viewsDirectory, 'partials'));

// Serve the supplied customer-facing HTML, styles, and images from the
// conventional Express public directory.
app.use(express.static(publicDirectory));

// A small diagnostic endpoint makes it easy to confirm that Express is live.
app.get('/health', (_request, response) => {
  response.json({ status: 'ok', application: 'travlr' });
});

app.use('/', travelerRouter);
app.use('/api', apiRouter);

const adminDirectory = path.join(__dirname, 'app_admin', 'dist', 'app-admin', 'browser');
app.use('/admin', express.static(adminDirectory));
app.get(/^\/admin(?:\/.*)?$/, (_request, response) => {
  response.sendFile(path.join(adminDirectory, 'index.html'));
});

app.use((_request, response) => {
  response.status(404).type('text').send('Not Found');
});

module.exports = app;

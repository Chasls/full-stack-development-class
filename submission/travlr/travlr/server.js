'use strict';

const app = require('./app');

const port = Number.parseInt(process.env.PORT, 10) || 3000;

const server = app.listen(port, () => {
  console.log(`Travlr Getaways is running at http://localhost:${port}`);
});

function shutDown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);

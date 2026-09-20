'use strict';

const app = require('./app');
const { connect, disconnect } = require('./app_server/models/db');

const port = Number.parseInt(process.env.PORT, 10) || 3000;

async function start() {
  try {
    await connect();
    const server = app.listen(port, () => {
      console.log(`Travlr Getaways is running at http://localhost:${port}`);
    });

    async function shutDown() {
      server.close(async () => {
        await disconnect();
        process.exit(0);
      });
    }

    process.once('SIGINT', shutDown);
    process.once('SIGTERM', shutDown);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

start();

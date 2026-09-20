'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { connect, disconnect } = require('./db');
const Trip = require('./travlr');

const tripsPath = path.join(__dirname, '..', '..', 'data', 'trips.json');

async function seedTrips() {
  const trips = JSON.parse(fs.readFileSync(tripsPath, 'utf8'));
  if (!Array.isArray(trips) || trips.length === 0) {
    throw new Error('trips.json must contain a nonempty array');
  }
  if (new Set(trips.map((trip) => trip.code)).size !== trips.length) {
    throw new Error('trips.json contains duplicate trip codes');
  }

  for (const trip of trips) {
    await new Trip(trip).validate();
  }

  await Trip.init();
  await Trip.bulkWrite(trips.map((trip) => ({
    replaceOne: {
      filter: { code: trip.code },
      replacement: trip,
      upsert: true
    }
  })));

  return trips.length;
}

if (require.main === module) {
  (async () => {
    try {
      await connect();
      const count = await seedTrips();
      console.log(`Seeded ${count} trips in ${Trip.collection.name}.`);
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  })();
}

module.exports = { seedTrips };

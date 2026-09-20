'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { connect, disconnect, mongoose } = require('./db');

(async () => {
  try {
    await connect();
    const expected = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', '..', 'data', 'trips.json'), 'utf8'
    ));
    const collection = mongoose.connection.db.collection('trips');
    const documents = await collection.find({}, {
      projection: { _id: 0, code: 1, name: 1, length: 1, start: 1,
        resort: 1, perPerson: 1, image: 1, description: 1 }
    }).sort({ code: 1 }).toArray();

    assert.ok(documents.length >= expected.length, 'Seeded trips are missing');
    for (const trip of expected) {
      const stored = documents.find((document) => document.code === trip.code);
      assert.ok(stored, `Missing trip ${trip.code}`);
      assert.ok(stored.start instanceof Date, `${trip.code} start must be a MongoDB date`);
      for (const field of Object.keys(trip)) {
        assert.equal(
          field === 'start' ? stored.start.toISOString() : stored[field],
          trip[field],
          `${trip.code} has an unexpected ${field}`
        );
      }
    }

    console.log(`Database: ${mongoose.connection.db.databaseName}`);
    console.log(`Collection: ${collection.collectionName}`);
    console.log(`Document count: ${documents.length}`);
    console.log('Result: all seed fields match the stored documents');
    console.log(JSON.stringify(documents, null, 2));
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await disconnect();
  }
})();

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const tripsPath = path.join(__dirname, '..', '..', 'data', 'trips.json');
const trips = JSON.parse(fs.readFileSync(tripsPath, 'utf8'));

const travel = (_request, response) => {
  response.render('travel', {
    title: 'Travel - Travlr Getaways',
    trips
  });
};

module.exports = {
  travel
};

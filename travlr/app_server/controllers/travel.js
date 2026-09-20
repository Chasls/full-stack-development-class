'use strict';

const Trip = require('../models/travlr');

const travel = async (_request, response) => {
  try {
    const trips = await Trip.find().sort({ name: 1 }).lean();
    response.render('travel', {
      title: 'Travel - Travlr Getaways',
      trips
    });
  } catch (error) {
    console.error('Could not load trips:', error);
    response.status(503).type('text').send('Trip data unavailable');
  }
};

module.exports = {
  travel
};

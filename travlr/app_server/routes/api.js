'use strict';

const express = require('express');
const Trip = require('../models/travlr');

const router = express.Router();

router.get('/trips', async (_request, response) => {
  try {
    const trips = await Trip.find().sort({ name: 1 }).select('-_id -__v').lean();
    response.json(trips);
  } catch (error) {
    console.error('Could not load trips:', error);
    response.status(503).json({ error: 'Trip data unavailable' });
  }
});

router.get('/trips/:code', async (request, response) => {
  try {
    const trip = await Trip.findOne({ code: request.params.code }).select('-_id -__v').lean();
    if (!trip) {
      response.status(404).json({ error: 'Trip not found' });
      return;
    }
    response.json(trip);
  } catch (error) {
    console.error('Could not load trip:', error);
    response.status(503).json({ error: 'Trip data unavailable' });
  }
});

module.exports = router;

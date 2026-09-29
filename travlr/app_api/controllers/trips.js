'use strict';

const Trip = require('../models/travlr');

const tripsList = async (_request, response) => {
  try {
    const trips = await Trip.find({})
      .sort({ name: 1 })
      .select('-_id -__v')
      .lean()
      .exec();

    response.status(200).json(trips);
  } catch (error) {
    console.error('Could not load trips:', error);
    response.status(500).json({ error: 'Trip data unavailable' });
  }
};

const tripsFindByCode = async (request, response) => {
  try {
    const trip = await Trip.findOne({ code: request.params.tripCode })
      .select('-_id -__v')
      .lean()
      .exec();

    if (!trip) {
      response.status(404).json({ error: 'Trip not found' });
      return;
    }

    response.status(200).json(trip);
  } catch (error) {
    console.error('Could not load trip:', error);
    response.status(500).json({ error: 'Trip data unavailable' });
  }
};

module.exports = {
  tripsList,
  tripsFindByCode
};

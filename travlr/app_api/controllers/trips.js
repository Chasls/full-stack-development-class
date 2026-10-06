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

const fields = ['code', 'name', 'length', 'start', 'resort', 'perPerson', 'image', 'description'];
class InvalidTripError extends Error {}
function tripValues(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new InvalidTripError('Invalid trip');
  const values = {};
  for (const field of fields) {
    if (typeof body[field] !== 'string' || !body[field].trim()) throw new InvalidTripError(`${field} is required`);
    values[field] = body[field].trim();
  }
  if (!/^[A-Za-z0-9-]+$/.test(values.code)) throw new InvalidTripError('Code must contain letters, numbers, or hyphens');
  if (!/^[A-Za-z0-9_.-]+\.(jpg|jpeg|png|webp|gif)$/i.test(values.image)) throw new InvalidTripError('Use an image filename');
  // Descriptions are rendered as HTML on the public site; accept only the course formatting tags.
  const plainDescription = values.description.replace(/<\/?(?:p|strong|em|br)\s*\/?>/gi, '');
  if (plainDescription.includes('<') || plainDescription.includes('>')) {
    throw new InvalidTripError('Description supports only p, strong, em, and br tags without attributes');
  }
  return values;
}
function writeError(response, error) {
  if (error.code === 11000) return response.status(409).json({ error: 'Trip code already exists' });
  if (error.name === 'ValidationError' || error.name === 'CastError' || error instanceof InvalidTripError) {
    return response.status(400).json({ error: error.message });
  }
  console.error('Could not save trip:', error);
  return response.status(500).json({ error: 'Trip data unavailable' });
}
const tripsAdd = async (request, response) => {
  try {
    const trip = await Trip.create(tripValues(request.body));
    const result = trip.toObject();
    delete result._id;
    delete result.__v;
    response.status(201).location(`/api/trips/${encodeURIComponent(result.code)}`).json(result);
  } catch (error) { writeError(response, error); }
};
const tripsUpdate = async (request, response) => {
  try {
    const values = tripValues(request.body);
    if (values.code !== request.params.tripCode) return response.status(400).json({ error: 'Trip code cannot be changed' });
    const trip = await Trip.findOneAndUpdate({ code: request.params.tripCode }, { $set: values },
      { new: true, runValidators: true }).select('-_id -__v').lean().exec();
    if (!trip) return response.status(404).json({ error: 'Trip not found' });
    response.json(trip);
  } catch (error) { writeError(response, error); }
};
const tripsDelete = async (request, response) => {
  try {
    const trip = await Trip.findOneAndDelete({ code: request.params.tripCode }).exec();
    if (!trip) return response.status(404).json({ error: 'Trip not found' });
    response.status(204).end();
  } catch (error) {
    console.error('Could not delete trip:', error);
    response.status(500).json({ error: 'Trip data unavailable' });
  }
};
module.exports = { tripsList, tripsFindByCode, tripsAdd, tripsUpdate, tripsDelete };

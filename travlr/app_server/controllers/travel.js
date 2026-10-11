'use strict';

const travel = async (request, response) => {
  try {
    const apiUrl = `http://127.0.0.1:${request.socket.localPort}/api/trips`;
    const apiResponse = await fetch(apiUrl, {
      headers: { accept: 'application/json' }
    });

    if (!apiResponse.ok) {
      throw new Error(`Trip API returned HTTP ${apiResponse.status}`);
    }

    const trips = await apiResponse.json();
    const location = typeof request.query.location === 'string' ? request.query.location.trim().slice(0, 100) : '';
    const rawPrice = typeof request.query.maxPrice === 'string' ? request.query.maxPrice.trim() : '';
    const maxPrice = rawPrice === '' ? null : Number(rawPrice);
    if (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0)) return response.status(400).type('text').send('Maximum price must be a nonnegative number');
    const filtered = trips.filter(trip => (!location || `${trip.name} ${trip.resort}`.toLowerCase().includes(location.toLowerCase())) && (maxPrice === null || Number(trip.perPerson.replace(/[^0-9.]/g, '')) <= maxPrice));
    response.render('travel', {
      title: 'Travel - Travlr Getaways',
      trips: filtered.map(trip => ({...trip, startDisplay: new Date(trip.start).toLocaleDateString('en-US', {timeZone: 'UTC'})})), location, maxPrice: rawPrice
    });
  } catch (error) {
    console.error('Could not load trips from the API:', error);
    response.status(502).type('text').send('Trip data unavailable');
  }
};

module.exports = {
  travel
};

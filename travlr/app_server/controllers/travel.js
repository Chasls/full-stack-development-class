'use strict';

const travel = async (request, response) => {
  try {
    const apiUrl = `${request.protocol}://${request.get('host')}/api/trips`;
    const apiResponse = await fetch(apiUrl, {
      headers: { accept: 'application/json' }
    });

    if (!apiResponse.ok) {
      throw new Error(`Trip API returned HTTP ${apiResponse.status}`);
    }

    const trips = await apiResponse.json();
    response.render('travel', {
      title: 'Travel - Travlr Getaways',
      trips
    });
  } catch (error) {
    console.error('Could not load trips from the API:', error);
    response.status(502).type('text').send('Trip data unavailable');
  }
};

module.exports = {
  travel
};

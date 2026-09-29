'use strict';

const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, index: true },
  length: { type: String, required: true, trim: true },
  start: { type: Date, required: true },
  resort: { type: String, required: true, trim: true },
  perPerson: { type: String, required: true, trim: true },
  image: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true }
}, { collection: 'trips' });

module.exports = mongoose.model('Trip', tripSchema);

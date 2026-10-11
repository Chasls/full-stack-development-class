const Reservation = require('../models/reservation');
const Trip = require('../models/travlr');
const mongoose = require('mongoose');
async function list(req, res) {
 try {res.json(await Reservation.find({user: req.user._id}).select('-user -__v').sort({start: 1}).lean());}
 catch {res.status(500).json({error: 'Itinerary unavailable'});}
}
async function add(req, res) {
 if (typeof req.body?.tripCode !== 'string' || !/^[A-Za-z0-9-]+$/.test(req.body.tripCode)) return res.status(400).json({error: 'Provide a valid trip code'});
 try {
  const trip = await Trip.findOne({code: req.body.tripCode});
  if (!trip) return res.status(404).json({error: 'Trip not found'});
  await Reservation.init();
  const reservation = await Reservation.create({user: req.user._id, tripCode: trip.code, name: trip.name, start: trip.start, length: trip.length, resort: trip.resort, perPerson: trip.perPerson});
  const result = reservation.toObject(); delete result.user; delete result.__v;
  res.status(201).json(result);
 } catch(error) {res.status(error.code === 11000 ? 409 : 500).json({error: error.code === 11000 ? 'This trip is already in your itinerary' : 'Reservation unavailable'});}
}
async function cancel(req, res) {
 if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({error: 'Invalid reservation ID'});
 try {
  const reservation = await Reservation.findOneAndUpdate({_id: req.params.id, user: req.user._id}, {$set: {status: 'cancelled'}}, {new: true}).select('-user -__v').lean();
  if (!reservation) return res.status(404).json({error: 'Reservation not found'});
  res.json(reservation);
 } catch {res.status(500).json({error: 'Cancellation unavailable'});}
}
module.exports = {list, add, cancel};

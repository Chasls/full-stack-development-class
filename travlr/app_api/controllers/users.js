const User = require('../models/user');
const Reservation = require('../models/reservation');
const mongoose = require('mongoose');
async function list(req, res) {
 try {res.json(await User.find({role: 'user'}).select('name email role').sort({name: 1}).lean());}
 catch {res.status(500).json({error: 'Customer data unavailable'});}
}
async function update(req, res) {
 if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({error: 'Invalid customer ID'});
 const {name, email} = req.body || {};
 if (typeof name !== 'string' || !name.trim() || name.length > 100 || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({error: 'Provide a name and valid email'});
 try {
  const user = await User.findOneAndUpdate({_id: req.params.id, role: 'user'}, {$set: {name: name.trim(), email: email.trim().toLowerCase()}}, {new: true, runValidators: true}).select('name email role').lean();
  if (!user) return res.status(404).json({error: 'Customer not found'});
  res.json(user);
 } catch(error) {res.status(error.code === 11000 ? 409 : 500).json({error: error.code === 11000 ? 'Email already registered' : 'Customer update unavailable'});}
}
async function remove(req, res) {
 if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({error: 'Invalid customer ID'});
 try {
  const user = await User.findOneAndDelete({_id: req.params.id, role: 'user'});
  if (!user) return res.status(404).json({error: 'Customer not found'});
  await Reservation.deleteMany({user: user._id});
  res.status(204).end();
 } catch {res.status(500).json({error: 'Customer deletion unavailable'});}
}
module.exports = {list, update, remove};

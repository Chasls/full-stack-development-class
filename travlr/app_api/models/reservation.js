const mongoose = require('mongoose');
const schema = new mongoose.Schema({
 user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
 tripCode: {type: String, required: true},
 name: {type: String, required: true},
 start: {type: Date, required: true},
 length: {type: String, required: true},
 resort: {type: String, required: true},
 perPerson: {type: String, required: true},
 status: {type: String, enum: ['booked', 'cancelled'], default: 'booked'}
}, {timestamps: true});
schema.index({user: 1, tripCode: 1}, {unique: true});
module.exports = mongoose.model('Reservation', schema);

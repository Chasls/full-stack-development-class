const mongoose = require('mongoose');
const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const derive = require('node:util').promisify(scrypt);
const schema = new mongoose.Schema({
 name: {type: String, required: true, trim: true},
 email: {type: String, required: true, unique: true, lowercase: true, trim: true},
 salt: {type: String, required: true, select: false},
 hash: {type: String, required: true, select: false},
 role: {type: String, enum: ['user', 'admin'], default: 'user'}
});
schema.methods.setPassword = async function(password) {
 this.salt = randomBytes(16).toString('hex');
 this.hash = (await derive(password, this.salt, 64)).toString('hex');
};
schema.methods.validPassword = async function(password) {
 return timingSafeEqual(await derive(password, this.salt, 64), Buffer.from(this.hash, 'hex'));
};
module.exports = mongoose.model('User', schema);

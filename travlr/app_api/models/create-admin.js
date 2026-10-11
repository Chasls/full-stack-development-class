const {connect, disconnect} = require('./db');
const User = require('./user');
(async () => {
 const {ADMIN_EMAIL: email, ADMIN_PASSWORD: password} = process.env;
 if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12 || password.length > 128) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12 to 128 characters)');
 await connect();
 if (await User.findOne({email: email.trim().toLowerCase()})) throw new Error('Email already exists; existing accounts are not automatically promoted');
 const user = new User({name: process.env.ADMIN_NAME || 'Travlr Administrator', email, role: 'admin'});
 await user.setPassword(password); await user.save(); console.log('Administrator created.');
})().catch(error => {console.error(error.message); process.exitCode = 1;}).finally(disconnect);

const User = require('../models/user');
const {tokenFor} = require('../security');
function credentials(body) {
 if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') return null;
 const email = body.email.trim().toLowerCase();
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || body.password.length > 128) return null;
 return {email, password: body.password};
}
async function register(req, res) {
 const values = credentials(req.body);
 if (!values || values.password.length < 12 || typeof req.body.name !== 'string' || !req.body.name.trim() || req.body.name.length > 100) return res.status(400).json({error: 'Provide a name, valid email, and password of 12 to 128 characters'});
 try {
  // Public registration cannot grant administrator permissions.
  const user = new User({name: req.body.name.trim(), email: values.email, role: 'user'});
  await user.setPassword(values.password); await user.save();
  res.status(201).json({token: tokenFor(user)});
 } catch(error) { res.status(error.code === 11000 ? 409 : 500).json({error: error.code === 11000 ? 'Email already registered' : 'Registration unavailable'}); }
}
async function login(req, res) {
 const values = credentials(req.body);
 if (!values || !values.password) return res.status(400).json({error: 'Provide a valid email and password'});
 try {
  const user = await User.findOne({email: values.email}).select('+salt +hash');
  if (!user || !await user.validPassword(values.password)) return res.status(401).json({error: 'Email or password is incorrect'});
  res.json({token: tokenFor(user)});
 } catch { res.status(500).json({error: 'Login unavailable'}); }
}
module.exports = {register, login};

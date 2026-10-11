const jwt = require('jsonwebtoken');
const User = require('./models/user');
const configured = process.env.JWT_SECRET;
if (configured && Buffer.byteLength(configured) < 32) throw new Error('JWT_SECRET requires at least 32 bytes');
if (!configured && process.env.NODE_ENV === 'production') throw new Error('Set JWT_SECRET in production');
const secret = configured || require('node:crypto').randomBytes(48).toString('hex');
const options = {algorithm: 'HS256', issuer: 'travlr', audience: 'travlr-admin', expiresIn: '1h'};
const tokenFor = user => jwt.sign({name: user.name, email: user.email, role: user.role}, secret, {...options, subject: String(user._id)});
async function requireAdmin(req, res, next) {
 const match = /^Bearer ([^\s]+)$/i.exec(req.get('Authorization') || '');
 if (!match) return res.status(401).json({error: 'Login required'});
 let payload;
 try { payload = jwt.verify(match[1], secret, {algorithms: ['HS256'], issuer: options.issuer, audience: options.audience}); }
 catch { return res.status(401).json({error: 'Invalid or expired token'}); }
 if (!/^[a-f0-9]{24}$/i.test(payload.sub || '')) return res.status(401).json({error: 'Invalid token'});
 try {
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({error: 'User no longer exists'});
  if (user.role !== 'admin') return res.status(403).json({error: 'Administrator access required'});
  req.user = user; next();
 } catch { res.status(500).json({error: 'Authentication unavailable'}); }
}
module.exports = {tokenFor, requireAdmin};

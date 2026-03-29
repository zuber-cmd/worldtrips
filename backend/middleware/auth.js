const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || !String(s).trim()) {
    throw new Error('JWT_SECRET environment variable is required but not set');
  }
  return s;
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Login required.' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), getJwtSecret());
    next();
  } catch (e) {
    const msg = e.name === 'TokenExpiredError' ? 'Session expired. Please login again.' : 'Invalid token.';
    return res.status(401).json({ success: false, message: msg });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    next();
  });
}

function signTokens(user) {
  const secret = getJwtSecret();
  const payload = { id: user.id, email: user.email, role: user.role, full_name: user.full_name };
  const accessToken  = jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });
  const refreshToken = jwt.sign({ id: user.id }, secret, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });
  return { accessToken, refreshToken };
}

module.exports = { requireAuth, requireAdmin, signTokens, getJwtSecret };

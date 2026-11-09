import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-min-32-chars';
export function generateAccessToken(payload) {
    return jwt.sign({ ...payload, type: 'access' }, JWT_SECRET, { expiresIn: '15m' });
}
export function generateRefreshToken(payload) {
    return jwt.sign({ ...payload, type: 'refresh' }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
}
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    }
    catch {
        return null;
    }
}
export function hashToken(token) {
    return jwt.sign({ token }, JWT_SECRET, { expiresIn: '7d' });
}
export function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Access token required' } });
        return;
    }
    const payload = verifyAccessToken(token);
    if (!payload || payload.type !== 'access') {
        res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired access token' } });
        return;
    }
    req.user = payload;
    next();
}
export function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } });
        return;
    }
    next();
}
export function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (token) {
        const payload = verifyAccessToken(token);
        if (payload && payload.type === 'access') {
            req.user = payload;
        }
    }
    next();
}

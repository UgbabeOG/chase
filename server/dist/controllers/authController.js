import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { database } from '../db/index.js';
import { generateAccessToken, generateRefreshToken, hashToken, verifyRefreshToken, AppError, asyncHandler } from '../middleware/index.js';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
function generateBackupCodes(count = 8) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
}
export const login = asyncHandler(async (req, res) => {
    const { username, password, otp } = req.body;
    const stmt = await database.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1');
    const user = await stmt.get(username);
    if (!user) {
        throw new AppError('INVALID_CREDENTIALS', 'Invalid username or password', 401);
    }
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
        throw new AppError('INVALID_CREDENTIALS', 'Invalid username or password', 401);
    }
    if (user.otp_enabled) {
        if (!otp) {
            const response = {
                success: true,
                data: { requires2FA: true },
            };
            res.json(response);
            return;
        }
        const verified = speakeasy.totp.verify({
            secret: user.otp_secret,
            encoding: 'base32',
            token: otp,
            window: 1,
        });
        if (!verified) {
            throw new AppError('INVALID_OTP', 'Invalid authentication code', 401);
        }
    }
    const accessToken = generateAccessToken({
        userId: user.id,
        username: user.username,
        role: user.role,
    });
    const refreshToken = generateRefreshToken({
        userId: user.id,
        username: user.username,
        role: user.role,
    });
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await (await database.prepare('INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)')).run(user.id, tokenHash, req.ip, req.headers['user-agent'], expiresAt);
    await (await database.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')).run(user.id);
    const { password_hash, otp_secret, ...userWithoutSecrets } = user;
    const response = {
        success: true,
        data: {
            accessToken,
            refreshToken,
            user: userWithoutSecrets,
        },
    };
    res.json(response);
});
export const login2FA = asyncHandler(async (req, res) => {
    const { username, password, otp } = req.body;
    const user = await (await database.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1')).get(username);
    if (!user || !user.otp_enabled) {
        throw new AppError('INVALID_CREDENTIALS', 'Invalid username or password', 401);
    }
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
        throw new AppError('INVALID_CREDENTIALS', 'Invalid username or password', 401);
    }
    if (!otp) {
        throw new AppError('OTP_REQUIRED', 'Authentication code required', 400);
    }
    const verified = speakeasy.totp.verify({
        secret: user.otp_secret,
        encoding: 'base32',
        token: otp,
        window: 1,
    });
    if (!verified) {
        throw new AppError('INVALID_OTP', 'Invalid authentication code', 401);
    }
    const accessToken = generateAccessToken({
        userId: user.id,
        username: user.username,
        role: user.role,
    });
    const refreshToken = generateRefreshToken({
        userId: user.id,
        username: user.username,
        role: user.role,
    });
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await (await database.prepare('INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)')).run(user.id, tokenHash, req.ip, req.headers['user-agent'], expiresAt);
    await (await database.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')).run(user.id);
    const { password_hash, otp_secret, ...userWithoutSecrets } = user;
    const response = {
        success: true,
        data: {
            accessToken,
            refreshToken,
            user: userWithoutSecrets,
        },
    };
    res.json(response);
});
export const logout = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (token) {
        const payload = verifyRefreshToken(token);
        if (payload) {
            const tokenHash = hashToken(token);
            await (await database.prepare('DELETE FROM sessions WHERE token_hash = ?')).run(tokenHash);
        }
    }
    const response = {
        success: true,
        data: { message: 'Logged out successfully' },
    };
    res.json(response);
});
export const refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new AppError('REFRESH_TOKEN_REQUIRED', 'Refresh token required', 400);
    }
    const payload = verifyRefreshToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
        throw new AppError('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token', 401);
    }
    const tokenHash = hashToken(refreshToken);
    const session = await (await database.prepare('SELECT * FROM sessions WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP')).get(tokenHash);
    if (!session) {
        throw new AppError('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token', 401);
    }
    const newAccessToken = generateAccessToken({
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
    });
    const newRefreshToken = generateRefreshToken({
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
    });
    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await (await database.prepare('DELETE FROM sessions WHERE token_hash = ?')).run(tokenHash);
    await (await database.prepare('INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)')).run(payload.userId, newTokenHash, req.ip, req.headers['user-agent'], expiresAt);
    const response = {
        success: true,
        data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        },
    };
    res.json(response);
});
export const getMe = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
    }
    const user = await (await database.prepare('SELECT id, username, email, role, first_name, last_name, phone, otp_enabled, is_active, created_at, updated_at, last_login FROM users WHERE id = ?')).get(req.user.userId);
    if (!user) {
        throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }
    const response = {
        success: true,
        data: user,
    };
    res.json(response);
});
export const setup2FA = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
    }
    const user = await (await database.prepare('SELECT * FROM users WHERE id = ?')).get(req.user.userId);
    if (!user) {
        throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }
    if (user.otp_enabled) {
        throw new AppError('2FA_ALREADY_ENABLED', 'Two-factor authentication is already enabled', 400);
    }
    const secret = speakeasy.generateSecret({
        name: `Chase Bank (${user.email})`,
        issuer: 'Chase Bank',
        length: 20,
    });
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    const backupCodes = generateBackupCodes();
    await (await database.prepare('UPDATE users SET otp_secret = ? WHERE id = ?')).run(secret.base32, req.user.userId);
    const response = {
        success: true,
        data: {
            secret: secret.base32,
            qrCodeUrl,
            backupCodes,
        },
    };
    res.json(response);
});
export const verify2FA = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
    }
    const { token } = req.body;
    if (!token) {
        throw new AppError('OTP_REQUIRED', 'Authentication code required', 400);
    }
    const user = await (await database.prepare('SELECT * FROM users WHERE id = ?')).get(req.user.userId);
    if (!user || !user.otp_secret) {
        throw new AppError('2FA_NOT_SETUP', 'Two-factor authentication not set up', 400);
    }
    if (user.otp_enabled) {
        throw new AppError('2FA_ALREADY_ENABLED', 'Two-factor authentication is already enabled', 400);
    }
    const verified = speakeasy.totp.verify({
        secret: user.otp_secret,
        encoding: 'base32',
        token,
        window: 1,
    });
    if (!verified) {
        throw new AppError('INVALID_OTP', 'Invalid authentication code', 401);
    }
    await (await database.prepare('UPDATE users SET otp_enabled = 1 WHERE id = ?')).run(req.user.userId);
    const response = {
        success: true,
        data: { message: 'Two-factor authentication enabled successfully' },
    };
    res.json(response);
});
export const disable2FA = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
    }
    const { password } = req.body;
    if (!password) {
        throw new AppError('PASSWORD_REQUIRED', 'Password required to disable 2FA', 400);
    }
    const user = await (await database.prepare('SELECT * FROM users WHERE id = ?')).get(req.user.userId);
    if (!user) {
        throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }
    if (!user.otp_enabled) {
        throw new AppError('2FA_NOT_ENABLED', 'Two-factor authentication is not enabled', 400);
    }
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
        throw new AppError('INVALID_PASSWORD', 'Invalid password', 401);
    }
    await (await database.prepare('UPDATE users SET otp_enabled = 0, otp_secret = NULL WHERE id = ?')).run(req.user.userId);
    const response = {
        success: true,
        data: { message: 'Two-factor authentication disabled successfully' },
    };
    res.json(response);
});

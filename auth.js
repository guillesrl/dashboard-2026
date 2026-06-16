// Autenticación simple con contraseña única.
// Token firmado con HMAC-SHA256 (sin dependencias externas).
// La auth solo se activa si DASHBOARD_PASSWORD está definida; si no, queda deshabilitada.
import crypto from 'crypto';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || '';
const SECRET = process.env.JWT_SECRET || DASHBOARD_PASSWORD || 'insecure-dev-secret';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

export const authEnabled = !!DASHBOARD_PASSWORD;

const b64url = (buf) => Buffer.from(buf).toString('base64url');

function sign(payloadStr) {
  return crypto.createHmac('sha256', SECRET).update(payloadStr).digest('base64url');
}

export function createToken() {
  const payload = b64url(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  const expected = sign(payload);
  // Comparación en tiempo constante
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && Date.now() < exp;
  } catch {
    return false;
  }
}

export function checkPassword(password) {
  if (!authEnabled || typeof password !== 'string') return false;
  const a = Buffer.from(password);
  const b = Buffer.from(DASHBOARD_PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Middleware: exige token válido en Authorization: Bearer <token>.
// Si la auth está deshabilitada (sin contraseña configurada), deja pasar.
export function requireAuth(req, res, next) {
  if (!authEnabled) return next();
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (verifyToken(token)) return next();
  return res.status(401).json({ success: false, error: 'No autorizado' });
}

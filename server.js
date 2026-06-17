import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { authEnabled, createToken, checkPassword, requireAuth } from './auth.js';
import { notifyTelegram } from './notify.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 80;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL debe estar definida en las variables de entorno');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

// Zod validation schemas
const menuSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  category: z.string().min(1).max(100),
  stock: z.number().int().min(0).default(0),
  description: z.string().optional(),
  vegetariano: z.string().optional(),
  gluten: z.string().optional(),
  marisco: z.string().optional(),
  lactosa: z.string().optional(),
  vegano: z.string().optional(),
});

const orderSchema = z.object({
  customer_name: z.string().min(1).max(255),
  customer_phone: z.string().optional(),
  items: z.array(z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    quantity: z.number().int().min(1),
  })).min(1),
  total: z.number().positive(),
  status: z.enum(['pending', 'preparing', 'ready', 'delivered', 'cancelled']).optional(),
});

const reservationSchema = z.object({
  customer_name: z.string().min(1).max(255),
  customer_phone: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  guests: z.number().int().min(1),
  status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']).optional(),
  notes: z.string().optional(),
});

const mapMenuItem = (row) => ({
  id: row.id,
  name: row.nombre,
  description: row.ingredientes,
  price: parseFloat(row.precio),
  category: row.categoria,
  stock: row.stock,
  available: row.stock > 0,
  vegetariano: row.vegetariano,
  gluten: row.gluten,
  marisco: row.marisco,
  lactosa: row.lactosa,
  vegano: row.vegano,
  ingredientes: row.ingredientes,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const mapOrder = (row) => {
  let correctedTime = row.time;
  let formattedDateTime = null;

  if (row.time) {
    const t = row.time.toString();
    correctedTime = t.length === 4 && t.includes(':') ? '0' + t : t.substring(0, 5);
    const date = row.created_at
      ? new Date(row.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    formattedDateTime = `${date} ${correctedTime}`;
  } else if (row.created_at) {
    formattedDateTime = new Date(row.created_at).toISOString().replace('T', ' ').substring(0, 19);
    correctedTime = new Date(row.created_at).toTimeString().substring(0, 5);
  }

  return {
    id: row.id,
    customer_name: row.nombre,
    customer_phone: row.telefono,
    customer_email: null,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    total: parseFloat(row.total),
    status: row.status,
    notes: null,
    created_at: row.created_at,
    time: correctedTime,
    order_datetime: formattedDateTime,
    updated_at: row.updated_at,
  };
};

const mapReservation = (row) => ({
  id: row.id,
  customer_name: row.customer_name,
  customer_phone: row.phone,
  customer_email: null,
  date: row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date,
  time: row.time ? row.time.toString().substring(0, 5) : row.time,
  guests: row.people,
  table_number: row.table_number,
  status: row.status,
  google_event_id: row.google_event_id,
  notes: row.observations,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co", "https://*.neon.tech"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "data:"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ============================================
// HEALTH
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// ============================================
// AUTH (rutas públicas)
// ============================================

app.get('/api/auth/status', (req, res) => {
  res.json({ success: true, data: { enabled: authEnabled } });
});

app.post('/api/login', (req, res) => {
  if (!authEnabled) return res.json({ success: true, data: { token: null, enabled: false } });
  const { password } = req.body || {};
  if (!checkPassword(password)) {
    return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
  }
  res.json({ success: true, data: { token: createToken() } });
});

// A partir de aquí, todas las rutas /api requieren autenticación
app.use('/api', requireAuth);

app.get('/api/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1');
    res.json({ success: true, data: { status: 'ok', db_connected: true } });
  } catch (err) {
    res.status(500).json({ success: false, data: { status: 'error', db_connected: false, error: err.message } });
  }
});

// ============================================
// ANALYTICS
// ============================================

app.get('/api/analytics/sales-by-hour', async (req, res) => {
  try {
    const pad = (n) => String(n).padStart(2, '0');
    const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const isDateStr = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

    const now = new Date();
    const { from, to } = req.query;

    // Rango: from/to (YYYY-MM-DD) o por defecto el mes actual
    const startDate = isDateStr(from)
      ? new Date(`${from}T00:00:00`)
      : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endDate = isDateStr(to)
      ? new Date(`${to}T23:59:59.999`)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const { rows } = await pool.query(
      `SELECT created_at, total FROM orders WHERE created_at >= $1 AND created_at <= $2`,
      [startDate.toISOString(), endDate.toISOString()]
    );

    // Buckets por día (de startDate a endDate inclusive)
    const buckets = {};
    const ordered = [];
    const cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const last = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    while (cur <= last) {
      const key = dateKey(cur);
      buckets[key] = { date: key, sales: 0 };
      ordered.push(key);
      cur.setDate(cur.getDate() + 1);
    }

    rows.forEach((row) => {
      const key = dateKey(new Date(row.created_at));
      if (buckets[key]) buckets[key].sales += parseFloat(row.total);
    });

    res.json(ordered.map((k) => buckets[k]));
  } catch (err) {
    console.error('❌ Error en GET /api/analytics/sales-by-hour:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// MENU
// ============================================

app.get('/api/menu', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM menu ORDER BY id ASC');
    res.json({ success: true, data: rows.map(mapMenuItem) });
  } catch (err) {
    console.error('❌ Error en GET /api/menu:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const v = menuSchema.safeParse(req.body);
    if (!v.success) return res.status(400).json({ success: false, error: v.error.errors.map(e => e.message).join(', ') });

    const { name, price, category, stock, description, vegetariano, gluten, marisco, lactosa, vegano } = v.data;
    const { rows } = await pool.query(
      `INSERT INTO menu (nombre, categoria, precio, stock, ingredientes, vegetariano, gluten, marisco, lactosa, vegano)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, category, price, stock, description, vegetariano || 'no', gluten || 'no', marisco || 'no', lactosa || 'no', vegano || 'no']
    );
    res.json({ success: true, data: mapMenuItem(rows[0]) });
  } catch (err) {
    console.error('❌ Error en POST /api/menu:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, ingredientes, price, category, stock, vegetariano, gluten, marisco, lactosa, vegano } = req.body;
    const { rows } = await pool.query(
      `UPDATE menu SET nombre=$1, categoria=$2, precio=$3, stock=$4, ingredientes=$5,
       vegetariano=$6, gluten=$7, marisco=$8, lactosa=$9, vegano=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [name, category, price, stock, description || ingredientes, vegetariano || 'no', gluten || 'no', marisco || 'no', lactosa || 'no', vegano || 'no', id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: mapMenuItem(rows[0]) });
  } catch (err) {
    console.error('❌ Error en PUT /api/menu/:id:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM menu WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error en DELETE /api/menu/:id:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/menu/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const { rows } = await pool.query(
      'UPDATE menu SET stock=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [stock, id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: rows[0] });
    const newStock = Number(stock);
    if (!Number.isNaN(newStock) && newStock < 5) {
      notifyTelegram(`⚠️ <b>Stock bajo</b>\n${rows[0].nombre}: ${newStock} ud.`);
    }
  } catch (err) {
    console.error('❌ Error en PATCH /api/menu/:id/stock:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// ORDERS
// ============================================

app.get('/api/orders', async (req, res) => {
  try {
    const { filter } = req.query;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    let queryText = 'SELECT * FROM orders';
    const params = [];

    if (filter === 'today') {
      queryText += ' WHERE created_at >= $1';
      params.push(today);
    } else if (filter === 'month') {
      queryText += ' WHERE created_at >= $1';
      params.push(monthStart);
    } else if (filter === 'active') {
      queryText += " WHERE status NOT IN ('delivered', 'cancelled')";
    }

    queryText += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(queryText, params);
    res.json({ success: true, data: rows.map(mapOrder) });
  } catch (err) {
    console.error('❌ Error en GET /api/orders:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const v = orderSchema.safeParse(req.body);
    if (!v.success) return res.status(400).json({ success: false, error: v.error.errors.map(e => e.message).join(', ') });

    const { customer_name, customer_phone, items, total, status = 'pending' } = v.data;
    const { rows } = await pool.query(
      `INSERT INTO orders (nombre, telefono, direccion, items, total, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [customer_name, customer_phone, 'Dirección no especificada', JSON.stringify(items), total, status]
    );
    res.json({ success: true, data: mapOrder(rows[0]) });
    notifyTelegram(`🧾 <b>Nuevo pedido</b>\n${customer_name}\n${items.length} artículo(s) · ${total.toFixed(2)}€`);
  } catch (err) {
    console.error('❌ Error en POST /api/orders:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { rows } = await pool.query(
      'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: mapOrder(rows[0]) });
  } catch (err) {
    console.error('❌ Error en PATCH /api/orders/:id/status:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// RESERVATIONS
// ============================================

app.get('/api/reservations', async (req, res) => {
  try {
    const { filter } = req.query;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    let queryText = 'SELECT * FROM reservations';
    const params = [];

    if (filter === 'today') {
      queryText += ' WHERE date = $1';
      params.push(today);
    } else if (filter === 'month') {
      queryText += ' WHERE date >= $1';
      params.push(monthStart);
    }

    queryText += ' ORDER BY date DESC, time DESC';
    const { rows } = await pool.query(queryText, params);
    res.json({ success: true, data: rows.map(r => mapReservation(r)) });
  } catch (err) {
    console.error('❌ Error en GET /api/reservations:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const v = reservationSchema.safeParse(req.body);
    if (!v.success) return res.status(400).json({ success: false, error: v.error.errors.map(e => e.message).join(', ') });

    const { customer_name, customer_phone, date, time, guests, status = 'confirmed', notes } = v.data;
    const { rows } = await pool.query(
      `INSERT INTO reservations (customer_name, phone, date, time, people, table_number, status, observations)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [customer_name, customer_phone || null, date, time, guests, null, status, notes]
    );
    res.json({ success: true, data: mapReservation(rows[0]) });
    notifyTelegram(`🗓️ <b>Nueva reserva</b>\n${customer_name} · ${guests} pers.\n${date} ${time}${notes ? `\n📝 ${notes}` : ''}`);
  } catch (err) {
    console.error('❌ Error en POST /api/reservations:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/reservations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { rows } = await pool.query(
      'UPDATE reservations SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, id]
    );
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Reservation not found' });
    res.json({ success: true, data: mapReservation(rows[0]) });
  } catch (err) {
    console.error('❌ Error en PATCH /api/reservations/:id/status:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reservations WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error en DELETE /api/reservations/:id:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================
// SERVER START
// ============================================

app.listen(port, () => {
  console.log(`✅ API server running on http://localhost:${port}`);
  console.log(`📊 Database: Neon PostgreSQL`);
});

process.on('SIGINT', () => { console.log('\n👋 Shutting down...'); process.exit(0); });
process.on('SIGTERM', () => { console.log('\n👋 Shutting down...'); process.exit(0); });

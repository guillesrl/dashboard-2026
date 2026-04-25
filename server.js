// Servidor Node.js con Express para la API REST usando Supabase
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno desde .env y .env.production
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 80;

// Configurar Supabase cliente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar definidas en .env o .env.production');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions para mapeo de datos
const mapMenuItem = (item) => ({
  id: item.id,
  name: item.nombre,
  description: item.ingredientes,
  price: item.precio,
  category: item.categoria,
  stock: item.stock,
  available: item.stock > 0,
  vegetariano: item.vegetariano,
  gluten: item.gluten,
  marisco: item.marisco,
  lactosa: item.lactosa,
  vegano: item.vegano,
  ingredientes: item.ingredientes,
  created_at: item.created_at,
  updated_at: item.updated_at
});

const mapOrder = (item) => {
  let correctedTime = item.time;
  let formattedDateTime = null;

  if (item.time) {
    if (item.time.length === 5 && item.time.includes(':')) {
      correctedTime = item.time;
    } else if (item.time.length === 4 && item.time.includes(':')) {
      correctedTime = '0' + item.time;
    }

    const date = item.created_at ? new Date(item.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    formattedDateTime = `${date} ${correctedTime}`;
  } else if (item.created_at) {
    formattedDateTime = new Date(item.created_at).toISOString().replace('T', ' ').substring(0, 19);
    correctedTime = new Date(item.created_at).toTimeString().substring(0, 5);
  }

  return {
    id: item.id,
    customer_name: item.nombre,
    customer_phone: item.telefono,
    customer_email: null,
    items: typeof item.items === 'string' ? JSON.parse(item.items) : item.items,
    total: parseFloat(item.total),
    status: item.status,
    notes: null,
    created_at: item.created_at,
    time: correctedTime,
    order_datetime: formattedDateTime,
    updated_at: item.updated_at
  };
};

const mapReservation = (item, formatTime = false) => {
  const mapped = {
    id: item.id,
    customer_name: item.customer_name,
    phone: item.phone,
    customer_email: null,
    date: item.date,
    time: item.time,
    guests: item.people,
    table_number: item.table_number,
    status: item.status,
    google_event_id: item.google_event_id,
    notes: item.observations,
    created_at: item.created_at,
    updated_at: item.updated_at
  };

  // Formatear tiempo solo si se solicita (para POST donde puede ser TIME type)
  if (formatTime && mapped.time) {
    mapped.time = mapped.time.toString().substring(0, 5);
  }

  return mapped;
};

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // 200 requests por ventana
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Async handler helper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));

  // Para cualquier ruta que no sea API, servir index.html (SPA routing)
  // Usamos regex para compatibilidad con Express 5
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// DB healthcheck
app.get('/api/db-health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('menu').select('count', { head: true });
    res.json({
      success: true,
      data: {
        status: 'ok',
        supabase_connected: !error,
        error: error ? error.message : null
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/analytics/sales-by-hour', async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('created_at, total')
      .not('total', 'is', null);

    if (error) throw error;

    // Obtener mes y año actual
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Filtrar órdenes del mes actual
    const currentMonthOrders = (orders || []).filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    // Crear array de días del mes actual
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const salesByDay = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return { date: dateStr, sales: 0 };
    });

    // Sumar ventas por día
    currentMonthOrders.forEach(order => {
      const orderDate = new Date(order.created_at);
      const day = orderDate.getDate();
      salesByDay[day - 1].sales += parseFloat(order.total);
    });

    res.json(salesByDay);
  } catch (error) {
    console.error('❌ Error en GET /api/analytics/sales-by-hour:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================

app.get('/api/menu', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    const mappedData = (data || []).map(mapMenuItem);

    res.json({ success: true, data: mappedData });
  } catch (error) {
    console.error('❌ Error en GET /api/menu:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      available,
      vegetariano,
      gluten,
      marisco,
      lactosa,
      vegano,
      ingredientes
    } = req.body;

    const { data, error } = await supabase
      .from('menu')
      .insert({
        nombre: name,
        categoria: category,
        precio: price,
        stock: stock,
        vegetariano: vegetariano || 'no',
        gluten: gluten || 'no',
        marisco: marisco || 'no',
        lactosa: lactosa || 'no',
        vegano: vegano || 'no',
        ingredientes: description || ingredientes
      })
      .select()
      .single();

    if (error) throw error;

    const mappedItem = mapMenuItem(data);

    res.json({ success: true, data: mappedItem });
  } catch (error) {
    console.error('❌ Error en POST /api/menu:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      stock,
      available,
      vegetariano,
      gluten,
      marisco,
      lactosa,
      vegano,
      ingredientes
    } = req.body;

    const { data, error } = await supabase
      .from('menu')
      .update({
        nombre: name,
        categoria: category,
        precio: price,
        stock: stock,
        vegetariano: vegetariano || 'no',
        gluten: gluten || 'no',
        marisco: marisco || 'no',
        lactosa: lactosa || 'no',
        vegano: vegano || 'no',
        ingredientes: description || ingredientes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const mappedItem = mapMenuItem(data);

    res.json({ success: true, data: mappedItem });
  } catch (error) {
    console.error('❌ Error en PUT /api/menu/:id:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('menu')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error en DELETE /api/menu/:id:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/menu/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const { data, error } = await supabase
      .from('menu')
      .update({
        stock: stock,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: data });
  } catch (error) {
    console.error('❌ Error en PATCH /api/menu/:id/stock:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ORDERS ENDPOINTS
// ============================================

app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mappedData = (data || []).map(mapOrder);

    res.json({ success: true, data: mappedData });
  } catch (error) {
    console.error('❌ Error en GET /api/orders:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, items, total, status = 'pending', notes } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        nombre: customer_name,
        telefono: customer_phone,
        direccion: 'Dirección no especificada',
        items: JSON.stringify(items),
        total: total,
        status: status
      })
      .select()
      .single();

    if (error) throw error;

    const mappedItem = mapOrder(data);

    res.json({ success: true, data: mappedItem });
  } catch (error) {
    console.error('❌ Error en POST /api/orders:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      throw error;
    }

    const mappedItem = {
      id: data.id,
      customer_name: data.nombre,
      customer_phone: data.telefono,
      customer_email: null,
      items: typeof data.items === 'string' ? JSON.parse(data.items) : data.items,
      total: parseFloat(data.total),
      status: data.status,
      notes: null,
      created_at: data.created_at,
      time: data.time,
      order_datetime: data.created_at,
      updated_at: data.updated_at
    };

    res.json({ success: true, data: mappedItem });
  } catch (error) {
    console.error('❌ Error en PATCH /api/orders/:id/status:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// RESERVATIONS ENDPOINTS
// ============================================

app.get('/api/reservations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) throw error;

    const mappedData = (data || []).map(mapReservation);

    res.json({ success: true, data: mappedData });
  } catch (error) {
    console.error('❌ Error en GET /api/reservations:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const { customer_name, phone, customer_email, date, time, guests, table_number, status = 'confirmed', notes } = req.body;

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        customer_name: customer_name,
        phone: phone,
        date: date,
        time: time,
        people: guests,
        table_number: table_number,
        status: status,
        observations: notes
      })
      .select()
      .single();

    if (error) throw error;

    const mappedItem = mapReservation(data, true); // true = formatear tiempo

    res.json({ success: true, data: mappedItem });
  } catch (error) {
    console.error('❌ Error en POST /api/reservations:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/reservations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Reservation not found' });
      }
      throw error;
    }

    const mappedItem = mapReservation(data);

    res.json({ success: true, data: mappedItem });
  } catch (error) {
    console.error('❌ Error en PATCH /api/reservations/:id/status:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SERVER START
// ============================================

app.listen(port, () => {
  console.log(`✅ API server running on http://localhost:${port}`);
  console.log(`📊 Database: Supabase (eyqumoiygfbfvxvzupgy.supabase.co)`);
  console.log(`🔗 Conexión establecida con éxito!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Servidor Node.js con Express para la API REST usando Supabase
import express from 'express';
import cors from 'cors';
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

console.log('🚀 Starting server with Supabase...');

// Configurar Supabase cliente
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar definidas en .env o .env.production');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));

  // Para cualquier ruta que no sea API, servir index.html (SPA routing)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next(); // Dejar que las rutas de API continúen
    }
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

// ============================================
// MENU ENDPOINTS
// ============================================

app.get('/api/menu', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    const mappedData = (data || []).map(item => ({
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
    }));

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

    const mappedItem = {
      id: data.id,
      name: data.nombre,
      description: data.ingredientes,
      price: data.precio,
      category: data.categoria,
      stock: data.stock,
      available: data.stock > 0,
      vegetariano: data.vegetariano,
      gluten: data.gluten,
      marisco: data.marisco,
      lactosa: data.lactosa,
      vegano: data.vegano,
      ingredientes: data.ingredientes,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

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

    const mappedItem = {
      id: data.id,
      name: data.nombre,
      description: data.ingredientes,
      price: data.precio,
      category: data.categoria,
      stock: data.stock,
      available: data.stock > 0,
      vegetariano: data.vegetariano,
      gluten: data.gluten,
      marisco: data.marisco,
      lactosa: data.lactosa,
      vegano: data.vegano,
      ingredientes: data.ingredientes,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

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

    const mappedData = (data || []).map(item => {
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
    });

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
      updated_at: data.updated_at
    };

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

    const mappedData = (data || []).map(item => ({
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
    }));

    console.log(`📊 Enviando ${mappedData.length} reservas`);
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

    const mappedItem = {
      id: data.id,
      customer_name: data.customer_name,
      phone: data.phone,
      customer_email: null,
      date: data.date,
      time: data.time ? data.time.toString().substring(0, 5) : data.time,
      guests: data.people,
      table_number: data.table_number,
      status: data.status,
      google_event_id: data.google_event_id,
      notes: data.observations,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

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

    const mappedItem = {
      id: data.id,
      customer_name: data.customer_name,
      customer_phone: data.phone,
      customer_email: data.customer_email,
      date: data.date,
      time: data.time,
      guests: data.people,
      table_number: data.table_number,
      status: data.status,
      google_event_id: data.google_event_id,
      notes: data.observations,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

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

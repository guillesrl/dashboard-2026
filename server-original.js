// Servidor Node.js con Express para la API REST (versión original)
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const app = express();
const port = process.env.PORT || 3001;

console.log('Starting server (Original structure)...');

// Configuración de la base de datos
// Preferencia:
// - DATABASE_URL
// - Variables sueltas DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
const databaseUrl = process.env.DATABASE_URL;
const poolConfig = databaseUrl
  ? {
      connectionString: databaseUrl,
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

const sslEnabled = String(process.env.DB_SSL).toLowerCase() === 'true';

const pool = new Pool({
  ...poolConfig,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Middleware
app.use(cors());
app.use(express.json());

// Healthcheck (útil para EasyPanel / reverse proxy)
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// DB healthcheck (útil para verificar conectividad a PostgreSQL en EasyPanel)
app.get('/api/db-health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({
      success: true,
      data: {
        status: 'ok',
        database_url_set: Boolean(process.env.DATABASE_URL),
        db_host: process.env.DB_HOST || null,
        db_port: process.env.DB_PORT || null,
        db_name: process.env.DB_NAME || null,
        db_user: process.env.DB_USER || null,
        db_ssl: process.env.DB_SSL || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function para ejecutar queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Menu endpoints
app.get('/api/menu', async (req, res) => {
  try {
    const result = await query('SELECT * FROM menu ORDER BY id ASC');
    
    // Mapear los nombres de columnas de español a inglés
    const mappedData = result.rows.map(item => ({
      id: item.id,
      name: item.nombre,
      description: item.ingredientes,
      price: item.precio,
      category: item.categoria,
      stock: item.stock,
      available: item.stock > 0, // Asumir disponible si hay stock
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
    
    const result = await query(
      `INSERT INTO menu (nombre, categoria, precio, stock, vegetariano, gluten, marisco, lactosa, vegano, ingredientes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [name, category, price, stock, vegetariano || 'no', gluten || 'no', marisco || 'no', lactosa || 'no', vegano || 'no', description || ingredientes]
    );
    
    // Mapear la respuesta para que coincida con el frontend
    const mappedItem = {
      id: result.rows[0].id,
      name: result.rows[0].nombre,
      description: result.rows[0].ingredientes,
      price: result.rows[0].precio,
      category: result.rows[0].categoria,
      stock: result.rows[0].stock,
      available: result.rows[0].stock > 0,
      vegetariano: result.rows[0].vegetariano,
      gluten: result.rows[0].gluten,
      marisco: result.rows[0].marisco,
      lactosa: result.rows[0].lactosa,
      vegano: result.rows[0].vegano,
      ingredientes: result.rows[0].ingredientes,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at
    };
    
    res.json({ success: true, data: mappedItem });
  } catch (error) {
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
    
    const result = await query(
      `UPDATE menu SET 
       nombre = $1, 
       categoria = $2, 
       precio = $3, 
       stock = $4, 
       vegetariano = $5, 
       gluten = $6, 
       marisco = $7, 
       lactosa = $8, 
       vegano = $9, 
       ingredientes = $10, 
       updated_at = NOW() 
       WHERE id = $11 RETURNING *`,
      [name, category, price, stock, vegetariano || 'no', gluten || 'no', marisco || 'no', lactosa || 'no', vegano || 'no', description || ingredientes, id]
    );
    
    // Mapear la respuesta para que coincida con el frontend
    const mappedItem = {
      id: result.rows[0].id,
      name: result.rows[0].nombre,
      description: result.rows[0].ingredientes,
      price: result.rows[0].precio,
      category: result.rows[0].categoria,
      stock: result.rows[0].stock,
      available: result.rows[0].stock > 0,
      vegetariano: result.rows[0].vegetariano,
      gluten: result.rows[0].gluten,
      marisco: result.rows[0].marisco,
      lactosa: result.rows[0].lactosa,
      vegano: result.rows[0].vegano,
      ingredientes: result.rows[0].ingredientes,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at
    };
    
    res.json({ success: true, data: mappedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM menu WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/menu/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const result = await query(
      'UPDATE menu SET stock = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [stock, id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Orders endpoints
app.get('/api/orders', async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    
    // Mapear los nombres de columnas de español a inglés
    const mappedData = result.rows.map(item => {
      // Corregir directamente el campo time si es necesario
      let correctedTime = item.time;
      let formattedDateTime = null;
      
      if (item.time) {
        // Normalizar el formato del time
        if (item.time.length === 5 && item.time.includes(':')) { // Formato HH:MM
          correctedTime = item.time;
        } else if (item.time.length === 4 && item.time.includes(':')) { // Formato H:MM
          correctedTime = '0' + item.time;
        }
        
        // Combinar con la fecha de created_at
        const date = item.created_at ? item.created_at.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        formattedDateTime = `${date} ${correctedTime}`;
      } else if (item.created_at) {
        // Si no hay time, usar created_at formateado
        formattedDateTime = item.created_at.toISOString().replace('T', ' ').substring(0, 19);
        correctedTime = item.created_at.toTimeString().substring(0, 5);
      }
      
      return {
        id: item.id,
        customer_name: item.nombre,
        customer_phone: item.telefono,
        customer_email: null, // La tabla original no tiene email
        items: typeof item.items === 'string' ? JSON.parse(item.items) : item.items,
        total: parseFloat(item.total),
        status: item.status,
        notes: null, // La tabla original no tiene notas
        created_at: item.created_at,
        time: correctedTime, // Usar el tiempo corregido directamente
        order_datetime: formattedDateTime, // Campo combinado
        updated_at: item.updated_at
      };
    });
    
    res.json({ success: true, data: mappedData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, items, total, status = 'pending', notes } = req.body;
    
    const result = await query(
      'INSERT INTO orders (nombre, telefono, direccion, items, total, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [customer_name, customer_phone, 'Dirección no especificada', JSON.stringify(items), total, status]
    );
    
    // Mapear la respuesta para que coincida con el frontend
    const mappedItem = {
      id: result.rows[0].id,
      customer_name: result.rows[0].nombre,
      customer_phone: result.rows[0].telefono,
      customer_email: null,
      items: typeof result.rows[0].items === 'string' ? JSON.parse(result.rows[0].items) : result.rows[0].items,
      total: parseFloat(result.rows[0].total),
      status: result.rows[0].status,
      notes: null,
      created_at: result.rows[0].created_at,
      time: result.rows[0].time,
      updated_at: result.rows[0].updated_at
    };
    
    res.json({ success: true, data: mappedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar estado de orden
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    const order = result.rows[0];
    
    // Mapear campos de la BD al formato esperado por el frontend
    const mappedItem = {
      id: order.id,
      customer_name: order.nombre,
      customer_phone: order.telefono,
      customer_email: null,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
      total: parseFloat(order.total),
      status: order.status,
      notes: null,
      created_at: order.created_at,
      time: order.time,
      order_datetime: order.created_at,
      updated_at: order.updated_at
    };
    
    res.json({ success: true, data: mappedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reservations endpoints
app.get('/api/reservations', async (req, res) => {
  try {
    const result = await query('SELECT * FROM reservations ORDER BY date DESC, time DESC');
    
    // Simplificar el mapeo para evitar errores
    const mappedData = result.rows.map(item => {
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
      return mapped;
    });
    
    console.log(` Enviando ${mappedData.length} reservas`);
    res.json({ success: true, data: mappedData });
  } catch (error) {
    console.error(' Error en /api/reservations:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const { customer_name, phone, customer_email, date, time, guests, table_number, status = 'confirmed', notes } = req.body;
    
    const result = await query(
      'INSERT INTO reservations (customer_name, phone, date, time, people, table_number, status, observations) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [customer_name, phone, date, time, guests, table_number, status, notes]
    );
    
    // Mapear la respuesta para que coincida con el frontend
    const mappedItem = {
      id: result.rows[0].id,
      customer_name: result.rows[0].customer_name,
      phone: result.rows[0].phone,
      customer_email: null,
      date: result.rows[0].date,
      time: result.rows[0].time ? result.rows[0].time.toString().substring(0, 5) : result.rows[0].time,
      guests: result.rows[0].people,
      table_number: result.rows[0].table_number,
      status: result.rows[0].status,
      google_event_id: result.rows[0].google_event_id,
      notes: result.rows[0].observations,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at
    };
    
    res.json({ success: true, data: mappedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar estado de reserva
app.patch('/api/reservations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await query(
      'UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Reservation not found' });
    }
    
    const reservation = result.rows[0];
    
    // Mapear campos de la BD al formato esperado por el frontend
    const mappedItem = {
      id: reservation.id,
      customer_name: reservation.customer_name,
      customer_phone: reservation.phone,
      customer_email: reservation.customer_email,
      date: reservation.date,
      time: reservation.time,
      guests: reservation.people,
      table_number: reservation.table_number,
      status: reservation.status,
      google_event_id: reservation.google_event_id,
      notes: reservation.observations,
      created_at: reservation.created_at,
      updated_at: reservation.updated_at
    };
    
    res.json({ success: true, data: mappedItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');
const indexHtmlPath = path.join(distPath, 'index.html');

// En despliegues de 2 servicios (frontend separado), normalmente NO existirá `dist/` en el backend.
// Solo servimos el frontend si el build está presente.
if (fs.existsSync(indexHtmlPath)) {
  // Servir archivos estáticos de la carpeta 'dist' (donde Vite construye el proyecto)
  app.use(express.static(distPath));

  // Manejar cualquier otra ruta devolviendo el index.html de React
  app.get('/*', (req, res) => {
    res.sendFile(indexHtmlPath);
  });
} else {
  app.get('/', (req, res) => {
    res.status(200).send('Backend API running. Use /api/* endpoints.');
  });
}

// Iniciar servidor
app.listen(port, () => {
  console.log(` API server running on http://localhost:${port}`);
  console.log(` Database: PostgreSQL (Original structure)`);
});

// Cerrar conexión pool cuando el proceso termina
process.on('SIGINT', () => {
  console.log('👋 Shutting down gracefully...');
  pool.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('👋 Shutting down gracefully...');
  pool.end();
  process.exit(0);
});

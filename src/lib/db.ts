import { Pool } from 'pg';

// URL de conexión a PostgreSQL
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:River035@panel.guille.live:5432/n8n?sslmode=disable';

// Configuración de la base de datos PostgreSQL usando la URL de conexión
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Función helper para ejecutar queries
export async function query(text: string, params?: any[]) {
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

// Función para obtener un cliente del pool (para transacciones)
export function getClient() {
  return pool.connect();
}

// Cerrar el pool cuando la aplicación se cierra
process.on('exit', () => pool.end());
process.on('SIGINT', () => pool.end());
process.on('SIGTERM', () => pool.end());

export default pool;

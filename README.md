# Restaurant Dashboard

Panel de administración para restaurante con gestión de menú, pedidos y reservas.

## 🚀 Características

- **Gestión de Menú**: CRUD completo para items del menú con categorías y stock
- **Gestión de Pedidos**: Sistema de pedidos con estados y seguimiento
- **Gestión de Reservas**: Sistema de reservas con filtro por fecha y actualización en tiempo real
- **Base de Datos**: Supabase (PostgreSQL) para almacenamiento persistente
- **Interfaz Moderna**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Auto-refresh**: Dashboard se actualiza automáticamente cada 1 minuto
- **Analíticas**: Sección de gráficas para ventas por hora
- **Server-side Rendering**: Express sirve tanto API como frontend estático

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y desarrollo
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Componentes UI
- **Lucide React** - Iconos
- **React Query** - Gestión de estado del servidor

### Backend
- **Node.js 20+** - Runtime del servidor
- **Express.js 5** - Framework web
- **Supabase** - Base de datos PostgreSQL como servicio
- **@supabase/supabase-js** - Cliente oficial de Supabase
- **CORS** - Habilitar peticiones cross-origin
- **dotenv** - Gestión de variables de entorno

## 📋 Requisitos Previos

- Node.js 20+ (Node.js 18 está deprecated para Supabase)
- Cuenta en Supabase (proyecto configurado)
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd dashboard-2026
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` con:
```env
# Configuración Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=/api

# Servidor
PORT=8080
NODE_ENV=development
```

**Nota**: Para EasyPanel, usa el archivo `.env.production` con las mismas variables.

### 4. Base de Datos
El proyecto usa Supabase. Asegúrate de que tu proyecto Supabase tenga las siguientes tablas:

#### Tabla `menu`
```sql
CREATE TABLE menu (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ingredientes TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    stock INTEGER DEFAULT 0,
    vegetariano VARCHAR(10) DEFAULT 'no',
    gluten VARCHAR(10) DEFAULT 'no',
    marisco VARCHAR(10) DEFAULT 'no',
    lactosa VARCHAR(10) DEFAULT 'no',
    vegano VARCHAR(10) DEFAULT 'no',
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla `orders`
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    direccion VARCHAR(255) DEFAULT 'Dirección no especificada',
    items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    time VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla `reservations`
```sql
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    people INTEGER NOT NULL,
    table_number INTEGER,
    status VARCHAR(50) DEFAULT 'confirmed',
    google_event_id VARCHAR(255),
    observations TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🏃‍♂️ Ejecutar la Aplicación

### Opción 1: Desarrollo (Frontend + Backend)
```bash
npm run dev:full
```

### Opción 2: Desarrollo por separado
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run dev
```

### Opción 3: Producción
```bash
npm run build
npm start
```

## 🚀 Deploy en EasyPanel

Este proyecto está configurado para correr en **un solo servicio** (recomendado):

- **Servidor Unificado**: Express maneja tanto la API (`/api/*`) como el frontend estático
- **Sin proxy necesario**: Todo corre en el mismo puerto
- **Base de Datos**: Supabase en la nube

### Build Command
```bash
npm ci
npm run build
```

### Start Command
```bash
npm start
```

### Variables de entorno (EasyPanel)

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=80
NODE_ENV=production

# Opcional: forzar versión de Node.js
NODE_VERSION=20
```

### Estructura del Servidor

- **API Endpoints**: `/api/*` - manejados por Express
- **Frontend**: Archivos estáticos servidos desde `/dist`
- **Health Check**: `/api/health` - para verificar estado del servidor
- **DB Health Check**: `/api/db-health` - para verificar conexión a Supabase

## 📡 API Endpoints

### Menú
- `GET /api/menu` - Obtener todos los items
- `POST /api/menu` - Crear nuevo item
- `PUT /api/menu/:id` - Actualizar item
- `DELETE /api/menu/:id` - Eliminar item

### Pedidos
- `GET /api/orders` - Obtener todos los pedidos
- `POST /api/orders` - Crear nuevo pedido
- `PUT /api/orders/:id` - Actualizar pedido
- `PATCH /api/orders/:id/status` - Cambiar estado

### Analíticas
- `GET /api/analytics/sales-by-hour` - Obtener ventas totales desglosadas por hora

## 🔧 Configuración Avanzada

### Auto-refresh
El dashboard se actualiza automáticamente cada 60 segundos. Para cambiar la frecuencia, edita `src/pages/Index.tsx`:
```typescript
const interval = setInterval(() => {
  loadStats();
  loadReservations();
}, 60000); // Cambiar a milisegundos deseados
```

### Cache de Reservas
El servicio de reservas incluye cache en memoria con TTL de 5 segundos para optimizar el rendimiento y evitar llamadas API duplicadas.

### Variables de Entorno Soportadas
- `PORT`: Puerto del servidor (default: 80 en producción, 8080 en desarrollo)
- `NODE_ENV`: Entorno (development/production)
- `VITE_SUPABASE_URL`: URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase
- `VITE_API_URL`: URL base de la API (default: `/api`)

## 🐛 Troubleshooting

### Error de conexión a Supabase
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén configuradas correctamente
- Confirma que las tablas existan en tu proyecto Supabase

### Error "Node.js 18 and below are deprecated"
- Usa Node.js 20 o superior
- En EasyPanel, agrega `.nvmrc` con `20` o configura `NODE_VERSION=20`

### Error "Cannot GET /"
- Asegúrate de haber ejecutado `npm run build` para generar la carpeta `/dist`
- Verifica que el comando de inicio en producción sea `npm start`

### Error de Express 5 con rutas wildcard
- El proyecto usa `app.get(/^\/(?!api\/).*/, ...)` en lugar de `app.get('*')` para compatibilidad con Express 5

### Puerto en uso
- El servidor unificado usa el puerto configurado en `PORT` (default: 80)
- En desarrollo usa el puerto que asigne Vite (usualmente 5173)

### Logs duplicados
- Se implementó cache y locking en `ReservationsService` para prevenir llamadas simultáneas
- Las reservas se cargan centralizadamente en `Index.tsx` para evitar duplicados

## 📝 Notas de Desarrollo

- El proyecto usa TypeScript para tipado seguro
- Los componentes usan shadcn/ui para UI consistente
- La API sigue formato RESTful
- Las fechas se manejan con timezone local
- El filtro de reservas maneja correctamente zonas horarias
- El servidor Express sirve tanto API como frontend (SPA routing)
- To update dependencies, use `npm update` and check for breaking changes

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles

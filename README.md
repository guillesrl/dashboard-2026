# Restaurant Dashboard

Panel de administración para restaurante con gestión de menú, pedidos y reservas.

## 🚀 Características

- **Gestión de Menú**: CRUD completo para items del menú con categorías y stock
- **Gestión de Pedidos**: Sistema de pedidos con estados y seguimiento
- **Gestión de Reservas**: Sistema de reservas con filtro por fecha
- **Base de Datos**: PostgreSQL para almacenamiento persistente
- **Interfaz Moderna**: React + TypeScript + Tailwind CSS + shadcn/ui

## 🛠️ Tecnologías

### Frontend
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y desarrollo
- **Tailwind CSS** - Framework de estilos
- **shadcn/ui** - Componentes UI
- **Lucide React** - Iconos

### Backend
- **Node.js** - Runtime del servidor
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos
- **pg** - Cliente PostgreSQL para Node.js
- **CORS** - Habilitar peticiones cross-origin

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd restaurant-dashboard
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` con:
```env
# Configuración PostgreSQL
DATABASE_URL=postgres://usuario:password@host:5432/database?sslmode=disable
DB_HOST=localhost
DB_PORT=5432
DB_NAME=restaurant_db
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SSL=false

# Configuración API
VITE_API_URL=http://localhost:3001/api
```

### 4. Configurar base de datos
```bash
# Crear base de datos
createdb restaurant_db

# Crear tablas (opcional - el servidor las crea automáticamente)
psql -d restaurant_db -f setup-tables.sql
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
npm run preview
```

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

### Reservas
- `GET /api/reservations` - Obtener todas las reservas
- `POST /api/reservations` - Crear nueva reserva
- `PUT /api/reservations/:id` - Actualizar reserva
- `DELETE /api/reservations/:id` - Eliminar reserva

## 🗄️ Estructura de la Base de Datos

### Tabla `menu`
```sql
CREATE TABLE menu (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    stock INTEGER DEFAULT 0,
    disponible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla `orders`
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    direccion VARCHAR(255),
    items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla `reservations`
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

## 🔧 Configuración

### Servidor
- `server-original.js` - Servidor principal con mapeo de columnas español → inglés

### Scripts Útiles
```bash
npm run dev          # Iniciar frontend
npm run server       # Iniciar backend (server-original.js)
npm run dev:full     # Iniciar ambos simultáneamente
npm run build        # Build para producción
```

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL esté corriendo
- Confirma las credenciales en `.env`
- Asegúrate que la base de datos exista

### Error "require is not defined"
- El proyecto usa ES modules (`"type": "module"` en package.json)
- Usa `import` en lugar de `require`

### Puerto en uso
- El backend usa el puerto 3001
- El frontend usa el puerto 8080 (o el que asigne Vite)

## 📝 Notas de Desarrollo

- El proyecto usa TypeScript para tipado seguro
- Los componentes usan shadcn/ui para UI consistente
- La API sigue formato RESTful
- Las fechas se manejan con timezone local
- El filtro de reservas maneja correctamente zonas horarias

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles

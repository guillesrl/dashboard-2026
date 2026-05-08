// rutinas.ts — Rutinas asíncronas de carga y cálculo de datos del dashboard
import { OrdersService, Order } from '@/services/ordersService';
import { ReservationsService, Reservation } from '@/services/reservationsService';
import { parseNumber } from '@/lib/utils';
import type { MenuItem } from '@/services/menuService';

export interface DatosDashboard {
  pedidosHoy: Order[];
  pedidosMes: Order[];
  pedidosActivos: Order[];
  reservasHoy: Reservation[];
  reservasMes: Reservation[];
}

export interface EstadisticasDashboard {
  totalSales: number;
  monthlySales: number;
  activeOrders: number;
  monthlyOrders: number;
  todayReservations: number;
  monthlyReservations: number;
  menuItems: number;
  unavailableItems: number;
}

/**
 * Carga en paralelo todos los datos filtrados necesarios para el dashboard.
 * Centraliza las llamadas a los servicios para evitar lógica dispersa en componentes.
 */
export async function cargarDatosDashboard(): Promise<DatosDashboard> {
  const [pedidosHoy, pedidosMes, pedidosActivos, reservasHoy, reservasMes] = await Promise.all([
    OrdersService.getToday(),
    OrdersService.getThisMonth(),
    OrdersService.getActive(),
    ReservationsService.getToday(),
    ReservationsService.getThisMonth(),
  ]);

  return { pedidosHoy, pedidosMes, pedidosActivos, reservasHoy, reservasMes };
}

/**
 * Calcula las estadísticas del dashboard a partir de los datos cargados.
 * Función pura: sin efectos secundarios, fácil de testear.
 */
export function calcularEstadisticas(
  menuItemsList: MenuItem[],
  datos: DatosDashboard
): EstadisticasDashboard {
  const { pedidosHoy, pedidosMes, pedidosActivos, reservasHoy, reservasMes } = datos;

  const itemsWithPrice = menuItemsList.filter(item => item.price && item.price > 0);
  const menuCount = itemsWithPrice.length;
  const unavailableItems = itemsWithPrice.filter(item => item.stock < 1 || !item.available).length;

  const totalSales = pedidosHoy.reduce((sum, order) => sum + parseNumber(order.total), 0);
  const monthlySales = pedidosMes.reduce((sum, order) => sum + parseNumber(order.total), 0);

  return {
    totalSales,
    monthlySales,
    activeOrders: pedidosActivos.length,
    monthlyOrders: pedidosMes.length,
    todayReservations: reservasHoy.length,
    monthlyReservations: reservasMes.length,
    menuItems: menuCount,
    unavailableItems,
  };
}

import { api } from '@/lib/api';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: number;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  notes?: string;
  created_at?: string;
  time?: string;
  order_datetime?: string;
  updated_at?: string;
}

export class OrdersService {
  // Obtener todos los pedidos
  static async getAll(): Promise<Order[]> {
    const response = await api.getOrders();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch orders');
    }
    return response.data;
  }

  // Obtener pedido por ID
  static async getById(id: number): Promise<Order | null> {
    const orders = await this.getAll();
    return orders.find(order => order.id === id) || null;
  }

  // Crear nuevo pedido
  static async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const response = await api.createOrder(order);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create order');
    }
    return response.data;
  }

  // Actualizar pedido
  static async update(id: number, order: Partial<Order>): Promise<Order | null> {
    const response = await api.updateOrder(id, order);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update order');
    }
    return response.data;
  }

  // Eliminar pedido
  static async delete(id: number): Promise<boolean> {
    const response = await api.updateOrder(id, { deleted: true });
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete order');
    }
    return true;
  }

  // Actualizar estado del pedido
  static async updateStatus(id: number, status: Order['status']): Promise<Order | null> {
    const response = await api.updateOrderStatus(id, status);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update order status');
    }
    return response.data;
  }

  // Obtener pedidos por estado
  static async getByStatus(status: Order['status']): Promise<Order[]> {
    const orders = await this.getAll();
    return orders.filter(order => order.status === status);
  }

  // Obtener pedidos activos (no entregados ni cancelados)
  static async getActive(): Promise<Order[]> {
    const orders = await this.getAll();
    return orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
  }

  // Obtener pedidos de hoy
  static async getToday(): Promise<Order[]> {
    const orders = await this.getAll();
    const today = new Date().toISOString().split('T')[0];
    return orders.filter(order => {
      const orderDate = new Date(order.created_at || '').toISOString().split('T')[0];
      return orderDate === today;
    });
  }

  // Obtener pedidos del mes actual
  static async getThisMonth(): Promise<Order[]> {
    const orders = await this.getAll();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return orders.filter(order => {
      const orderDate = new Date(order.created_at || '');
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
  }
}

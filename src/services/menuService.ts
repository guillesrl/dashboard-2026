import { api } from '@/lib/api';

export interface MenuItem {
  id?: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  available: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export class MenuService {
  // Obtener todos los items del menú
  static async getAll(): Promise<MenuItem[]> {
    const response = await api.getMenuItems();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch menu items');
    }
    return response.data;
  }

  // Obtener item por ID
  static async getById(id: number): Promise<MenuItem | null> {
    // Por ahora implementamos como getAll y filtramos
    const items = await this.getAll();
    return items.find(item => item.id === id) || null;
  }

  // Crear nuevo item
  static async create(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    const response = await api.createMenuItem(item);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create menu item');
    }
    return response.data;
  }

  // Actualizar item
  static async update(id: number, item: Partial<MenuItem>): Promise<MenuItem | null> {
    const response = await api.updateMenuItem(id, item);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update menu item');
    }
    return response.data;
  }

  // Eliminar item
  static async delete(id: number): Promise<boolean> {
    const response = await api.deleteMenuItem(id);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete menu item');
    }
    return true;
  }

  // Actualizar stock
  static async updateStock(id: number, stock: number): Promise<MenuItem | null> {
    const response = await api.updateMenuItemStock(id, stock);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update stock');
    }
    return response.data;
  }

  // Obtener items por categoría
  static async getByCategory(category: string): Promise<MenuItem[]> {
    const items = await this.getAll();
    return items.filter(item => item.category === category);
  }

  // Obtener items disponibles
  static async getAvailable(): Promise<MenuItem[]> {
    const items = await this.getAll();
    return items.filter(item => item.available && item.stock > 0);
  }
}

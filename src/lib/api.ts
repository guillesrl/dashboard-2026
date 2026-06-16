/* eslint-disable @typescript-eslint/no-explicit-any */
// Cliente HTTP para comunicarse con una API REST
// Esto evita el problema de usar pg directamente en el navegador

import { getToken, handleUnauthorized } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  // Auth endpoints
  async getAuthStatus() {
    return this.request<{ enabled: boolean }>('/auth/status');
  }

  async login(password: string) {
    return this.request<{ token: string | null; enabled?: boolean }>('/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        ...options,
      });

      if (response.status === 401) {
        handleUnauthorized();
        return { success: false, error: 'No autorizado' };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Menu endpoints
  async getMenuItems() {
    return this.request<any[]>('/menu');
  }

  async createMenuItem(item: any) {
    return this.request<any>('/menu', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateMenuItem(id: number, item: any) {
    return this.request<any>(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteMenuItem(id: number) {
    return this.request<any>(`/menu/${id}`, {
      method: 'DELETE',
    });
  }

  async updateMenuItemStock(id: number, stock: number) {
    return this.request<any>(`/menu/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
  }

  // Orders endpoints
  async getOrders(filter?: 'today' | 'month' | 'active') {
    const query = filter ? `?filter=${filter}` : '';
    return this.request<any[]>(`/orders${query}`);
  }

  async createOrder(order: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrder(id: number, order: any) {
    return this.request<any>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  }

  async updateOrderStatus(id: number, status: string) {
    return this.request<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Reservations endpoints
  async getReservations(filter?: 'today' | 'month') {
    const query = filter ? `?filter=${filter}` : '';
    return this.request<any[]>(`/reservations${query}`);
  }

  async createReservation(reservation: any) {
    return this.request<any>('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservation),
    });
  }

  async updateReservation(id: number, reservation: any) {
    return this.request<any>(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reservation),
    });
  }

  async updateReservationStatus(id: number, status: string) {
    return this.request<any>(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteReservation(id: number) {
    return this.request<any>(`/reservations/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();

// Cliente HTTP para comunicarse con una API REST
// Esto evita el problema de usar pg directamente en el navegador

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

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
  async getOrders() {
    return this.request<any[]>('/orders');
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
  async getReservations() {
    return this.request<any[]>('/reservations');
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

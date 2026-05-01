import { api } from '@/lib/api';

export interface Reservation {
  id?: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  date: string;
  time: string;
  guests: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export class ReservationsService {
  static async getAll(): Promise<Reservation[]> {
    const response = await api.getReservations();
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch reservations');
    }
    return response.data;
  }

  static async getById(id: number): Promise<Reservation | null> {
    const reservations = await this.getAll();
    return reservations.find(reservation => reservation.id === id) || null;
  }

  static async create(reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>): Promise<Reservation> {
    const response = await api.createReservation(reservation);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create reservation');
    }
    return response.data;
  }

  static async update(id: number, reservation: Partial<Reservation>): Promise<Reservation | null> {
    const response = await api.updateReservation(id, reservation);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update reservation');
    }
    return response.data;
  }

  static async delete(id: number): Promise<boolean> {
    const response = await api.deleteReservation(id);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete reservation');
    }
    return true;
  }

  static async updateStatus(id: number, status: Reservation['status']): Promise<Reservation | null> {
    const response = await api.updateReservationStatus(id, status);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update reservation status');
    }
    return response.data;
  }

  static async getByDate(date: string): Promise<Reservation[]> {
    const reservations = await this.getAll();
    return reservations.filter(reservation => reservation.date === date);
  }

  static async getToday(): Promise<Reservation[]> {
    const response = await api.getReservations('today');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch today reservations');
    }
    return response.data;
  }

  static async getThisMonth(): Promise<Reservation[]> {
    const response = await api.getReservations('month');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch monthly reservations');
    }
    return response.data;
  }

  static async getConfirmed(): Promise<Reservation[]> {
    const reservations = await this.getAll();
    return reservations.filter(reservation => reservation.status === 'confirmed');
  }

  static async checkAvailability(date: string, time: string): Promise<boolean> {
    const reservations = await this.getAll();
    const confirmedReservations = reservations.filter(reservation => reservation.status === 'confirmed');
    const maxReservationsPerDay = 10;
    return confirmedReservations.filter(reservation => reservation.date === date).length < maxReservationsPerDay;
  }
}

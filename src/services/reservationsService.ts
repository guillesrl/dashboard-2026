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

// Cache y locking a nivel de clase
let reservationCache: Reservation[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5000; // 5 segundos de cache
let fetchLock: Promise<Reservation[]> | null = null;

export class ReservationsService {
  // Obtener todas las reservas (con cache y locking)
  static async getAll(): Promise<Reservation[]> {
    const now = Date.now();

    // Si hay una petición en curso, esperar a que termine
    if (fetchLock) {
      console.log('🔄 Waiting for ongoing fetch...');
      return await fetchLock;
    }

    // Si el cache es válido, devolverlo directamente
    if (reservationCache && (now - cacheTimestamp) < CACHE_TTL) {
      console.log('✅ Returning cached reservations');
      return reservationCache;
    }

    // Crear nueva promesa y guardarla en el lock
    fetchLock = (async () => {
      try {
        console.log('📊 Enviando reservas...');
        const response = await api.getReservations();

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch reservations');
        }

        // Actualizar cache
        reservationCache = response.data;
        cacheTimestamp = Date.now();

        return reservationCache;
      } finally {
        // Liberar lock
        fetchLock = null;
      }
    })();

    return await fetchLock;
  }

  // Limpiar cache (llamar después de crear/actualizar/eliminar)
  static clearCache() {
    reservationCache = null;
    cacheTimestamp = 0;
  }

  // Obtener reserva por ID
  static async getById(id: number): Promise<Reservation | null> {
    const reservations = await this.getAll();
    return reservations.find(reservation => reservation.id === id) || null;
  }

  // Crear nueva reserva
  static async create(reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>): Promise<Reservation> {
    const response = await api.createReservation(reservation);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create reservation');
    }
    this.clearCache();
    return response.data;
  }

  // Actualizar reserva
  static async update(id: number, reservation: Partial<Reservation>): Promise<Reservation | null> {
    const response = await api.updateReservation(id, reservation);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update reservation');
    }
    this.clearCache();
    return response.data;
  }

  // Eliminar reserva
  static async delete(id: number): Promise<boolean> {
    const response = await api.deleteReservation(id);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete reservation');
    }
    this.clearCache();
    return true;
  }

  // Actualizar estado de la reserva
  static async updateStatus(id: number, status: Reservation['status']): Promise<Reservation | null> {
    const response = await api.updateReservationStatus(id, status);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update reservation status');
    }
    this.clearCache();
    return response.data;
  }

  // Obtener reservas por fecha
  static async getByDate(date: string): Promise<Reservation[]> {
    const reservations = await this.getAll();
    return reservations.filter(reservation => reservation.date === date);
  }

  // Obtener reservas de hoy
  static async getToday(): Promise<Reservation[]> {
    const reservations = await this.getAll();
    const today = new Date().toISOString().split('T')[0];
    return reservations.filter(reservation => reservation.date === today);
  }

  // Obtener reservas del mes actual
  static async getThisMonth(): Promise<Reservation[]> {
    const reservations = await this.getAll();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      return reservationDate.getMonth() === currentMonth && reservationDate.getFullYear() === currentYear;
    });
  }

  // Obtener reservas confirmadas
  static async getConfirmed(): Promise<Reservation[]> {
    const reservations = await this.getAll();
    return reservations.filter(reservation => reservation.status === 'confirmed');
  }

  // Verificar disponibilidad para una fecha y hora específicas
  static async checkAvailability(date: string, time: string): Promise<boolean> {
    const reservations = await this.getAll();
    const confirmedReservations = reservations.filter(reservation => reservation.status === 'confirmed');
    
    // Permitir máximo 10 reservas confirmadas por día (ajustar según tu capacidad)
    const maxReservationsPerDay = 10;
    return confirmedReservations.filter(reservation => reservation.date === date).length < maxReservationsPerDay;
  }
}

// Singleton global con persistencia para prevenir llamadas API duplicadas
class ApiCallManager {
  private static instance: ApiCallManager;
  private menuItemsFetched = false;
  private ordersFetched = false;
  private reservationsFetched = false;

  private constructor() {
    // Restaurar estado desde sessionStorage si existe
    this.loadFromStorage();
  }

  static getInstance(): ApiCallManager {
    if (!ApiCallManager.instance) {
      ApiCallManager.instance = new ApiCallManager();
    }
    return ApiCallManager.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = sessionStorage.getItem('apiCallManagerState');
      if (stored) {
        const state = JSON.parse(stored);
        this.menuItemsFetched = state.menuItemsFetched || false;
        this.ordersFetched = state.ordersFetched || false;
        this.reservationsFetched = state.reservationsFetched || false;
      }
    } catch (error) {
      console.warn('Error loading API call manager state:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const state = {
        menuItemsFetched: this.menuItemsFetched,
        ordersFetched: this.ordersFetched,
        reservationsFetched: this.reservationsFetched
      };
      sessionStorage.setItem('apiCallManagerState', JSON.stringify(state));
    } catch (error) {
      console.warn('Error saving API call manager state:', error);
    }
  }

  shouldFetchMenuItems(): boolean {
    if (!this.menuItemsFetched) {
      this.menuItemsFetched = true;
      this.saveToStorage(); // Persistir estado
      return true;
    }
    return false;
  }

  shouldFetchOrders(): boolean {
    if (!this.ordersFetched) {
      this.ordersFetched = true;
      this.saveToStorage(); // Persistir estado
      return true;
    }
    return false;
  }

  shouldFetchReservations(): boolean {
    if (!this.reservationsFetched) {
      this.reservationsFetched = true;
      this.saveToStorage(); // Persistir estado
      return true;
    }
    return false;
  }

  reset(): void {
    this.menuItemsFetched = false;
    this.ordersFetched = false;
    this.reservationsFetched = false;
    this.saveToStorage(); // Persistir reset
  }
}

export const apiCallManager = ApiCallManager.getInstance();

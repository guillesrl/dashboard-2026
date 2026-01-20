// Singleton global para prevenir llamadas API duplicadas
class ApiCallManager {
  private static instance: ApiCallManager;
  private menuItemsFetched = false;
  private ordersFetched = false;
  private reservationsFetched = false;

  private constructor() {}

  static getInstance(): ApiCallManager {
    if (!ApiCallManager.instance) {
      ApiCallManager.instance = new ApiCallManager();
    }
    return ApiCallManager.instance;
  }

  shouldFetchMenuItems(): boolean {
    if (!this.menuItemsFetched) {
      this.menuItemsFetched = true;
      return true;
    }
    return false;
  }

  shouldFetchOrders(): boolean {
    if (!this.ordersFetched) {
      this.ordersFetched = true;
      return true;
    }
    return false;
  }

  shouldFetchReservations(): boolean {
    if (!this.reservationsFetched) {
      this.reservationsFetched = true;
      return true;
    }
    return false;
  }

  reset() {
    this.menuItemsFetched = false;
    this.ordersFetched = false;
    this.reservationsFetched = false;
  }
}

export const apiCallManager = ApiCallManager.getInstance();

// Estado global real para prevenir duplicaciones - más robusto que singleton
interface GlobalApiState {
  menuItemsFetched: boolean;
  ordersFetched: boolean;
  reservationsFetched: boolean;
}

// Variable global real - persiste entre todos los renders
const globalApiState: GlobalApiState = {
  menuItemsFetched: false,
  ordersFetched: false,
  reservationsFetched: false
};

export function shouldFetchMenuItems(): boolean {
  if (!globalApiState.menuItemsFetched) {
    globalApiState.menuItemsFetched = true;
    console.log('🟢 MenuItems fetch allowed');
    return true;
  }
  console.log('🔴 MenuItems fetch blocked');
  return false;
}

export function shouldFetchOrders(): boolean {
  if (!globalApiState.ordersFetched) {
    globalApiState.ordersFetched = true;
    console.log('🟢 Orders fetch allowed');
    return true;
  }
  console.log('🔴 Orders fetch blocked');
  return false;
}

export function shouldFetchReservations(): boolean {
  if (!globalApiState.reservationsFetched) {
    globalApiState.reservationsFetched = true;
    console.log('🟢 Reservations fetch allowed');
    return true;
  }
  console.log('🔴 Reservations fetch blocked');
  return false;
}

export function resetApiState(): void {
  globalApiState.menuItemsFetched = false;
  globalApiState.ordersFetched = false;
  globalApiState.reservationsFetched = false;
  console.log('🔄 API state reset');
}

// Debug: mostrar estado actual
export function getApiState(): GlobalApiState {
  return { ...globalApiState };
}

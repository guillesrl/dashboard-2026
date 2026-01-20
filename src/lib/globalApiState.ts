// Estado global real para prevenir duplicaciones - más robusto que singleton
interface GlobalApiState {
  menuItemsFetched: boolean;
  ordersFetched: boolean;
  reservationsFetched: boolean;
  lastFetchTime: number; // Timestamp del último fetch global
}

// Variable global real - persiste entre todos los renders
const globalApiState: GlobalApiState = {
  menuItemsFetched: false,
  ordersFetched: false,
  reservationsFetched: false,
  lastFetchTime: 0
};

export function shouldFetchMenuItems(): boolean {
  const now = Date.now();
  const timeSinceLastFetch = now - globalApiState.lastFetchTime;
  
  // Bloquear cualquier fetch por 10 segundos después del primero
  if (timeSinceLastFetch < 10000 && !globalApiState.menuItemsFetched) {
    globalApiState.menuItemsFetched = true;
    globalApiState.lastFetchTime = now;
    console.log('🟢 MenuItems fetch allowed', { timeSinceLastFetch, now });
    return true;
  }
  console.log('🔴 MenuItems fetch blocked', { timeSinceLastFetch, now });
  return false;
}

export function shouldFetchOrders(): boolean {
  const now = Date.now();
  const timeSinceLastFetch = now - globalApiState.lastFetchTime;
  
  // Bloquear cualquier fetch por 10 segundos después del primero
  if (timeSinceLastFetch < 10000 && !globalApiState.ordersFetched) {
    globalApiState.ordersFetched = true;
    globalApiState.lastFetchTime = now;
    console.log('🟢 Orders fetch allowed', { timeSinceLastFetch, now });
    return true;
  }
  console.log('🔴 Orders fetch blocked', { timeSinceLastFetch, now });
  return false;
}

export function shouldFetchReservations(): boolean {
  const now = Date.now();
  const timeSinceLastFetch = now - globalApiState.lastFetchTime;
  
  // Bloquear cualquier fetch por 10 segundos después del primero
  if (timeSinceLastFetch < 10000 && !globalApiState.reservationsFetched) {
    globalApiState.reservationsFetched = true;
    globalApiState.lastFetchTime = now;
    console.log('🟢 Reservations fetch allowed', { timeSinceLastFetch, now });
    return true;
  }
  console.log('🔴 Reservations fetch blocked', { timeSinceLastFetch, now });
  return false;
}

export function resetApiState(): void {
  globalApiState.menuItemsFetched = false;
  globalApiState.ordersFetched = false;
  globalApiState.reservationsFetched = false;
  globalApiState.lastFetchTime = 0;
  console.log('🔄 API state reset');
}

// Debug: mostrar estado actual
export function getApiState(): GlobalApiState {
  return { ...globalApiState };
}

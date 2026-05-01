import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MenuService, MenuItem } from '@/services/menuService';
import { OrdersService, Order } from '@/services/ordersService';
import { ReservationsService, Reservation } from '@/services/reservationsService';

export const MENU_KEYS = {
  all: ['menu'] as const,
  detail: (id: number) => ['menu', id] as const,
  category: (category: string) => ['menu', 'category', category] as const,
};

export const ORDERS_KEYS = {
  all: ['orders'] as const,
  detail: (id: number) => ['orders', id] as const,
  status: (status: string) => ['orders', 'status', status] as const,
};

export const RESERVATIONS_KEYS = {
  all: ['reservations'] as const,
  detail: (id: number) => ['reservations', id] as const,
  date: (date: string) => ['reservations', 'date', date] as const,
};

export function useMenu() {
  return useQuery({
    queryKey: MENU_KEYS.all,
    queryFn: () => MenuService.getAll(),
    staleTime: 30_000,
  });
}

export function useCreateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => MenuService.create(item),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MENU_KEYS.all }),
  });
}

export function useUpdateMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, item }: { id: number; item: Partial<MenuItem> }) => MenuService.update(id, item),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MENU_KEYS.all }),
  });
}

export function useDeleteMenu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => MenuService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MENU_KEYS.all }),
  });
}

export function useUpdateMenuStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) => MenuService.updateStock(id, stock),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MENU_KEYS.all }),
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ORDERS_KEYS.all,
    queryFn: () => OrdersService.getAll(),
    staleTime: 30_000,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => OrdersService.create(order),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.all }),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order['status'] }) => OrdersService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.all }),
  });
}

export function useReservations() {
  return useQuery({
    queryKey: RESERVATIONS_KEYS.all,
    queryFn: () => ReservationsService.getAll(),
    staleTime: 30_000,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => ReservationsService.create(reservation),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEYS.all }),
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: Reservation['status'] }) => ReservationsService.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEYS.all }),
  });
}

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { MENU_KEYS, ORDERS_KEYS, RESERVATIONS_KEYS } from '@/hooks/use-queries';
import { STOCK_LOW_THRESHOLD } from '@/hooks/use-stock-alerts';
import { toast } from '@/hooks/use-toast';

interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
}

interface MenuItemPayload {
  id: number;
  nombre: string;
  stock: number;
}

interface Order {
  id: number;
  nombre: string;
  total: number;
  status: string;
}

interface Reservation {
  id: number;
  customer_name: string;
  people: number;
}

export function useRealtime() {
  const queryClient = useQueryClient();
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  useEffect(() => {
    const menuChannel = supabase
      .channel('menu-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu' },
        (payload: RealtimePayload<MenuItemPayload>) => {
          queryClient.invalidateQueries({ queryKey: MENU_KEYS.all });

          if (payload.eventType === 'UPDATE') {
            const item = payload.new;
            if (item.stock === 0) {
              toast({
                title: "Sin stock",
                description: `${item.nombre} se quedó sin stock`,
                variant: "destructive",
              });
            } else if (item.stock > 0 && item.stock < STOCK_LOW_THRESHOLD) {
              toast({
                title: "Stock bajo",
                description: `${item.nombre} tiene solo ${item.stock} unidades`,
                variant: "default",
              });
            }
          }
        }
      )
      .subscribe();

    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: RealtimePayload<Order>) => {
          queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.all });

          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new;
            toast({
              title: "Nuevo pedido",
              description: `${newOrder.nombre} - $${newOrder.total}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Pedido actualizado",
              description: `Estado cambiado a ${payload.new.status}`,
            });
          }
        }
      )
      .subscribe();

    const reservationsChannel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        (payload: RealtimePayload<Reservation>) => {
          queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEYS.all });

          if (payload.eventType === 'INSERT') {
            const newRes = payload.new;
            toast({
              title: "Nueva reserva",
              description: `${newRes.customer_name} - ${newRes.people} personas`,
            });
          }
        }
      )
      .subscribe();

    channelsRef.current = [menuChannel, ordersChannel, reservationsChannel];

    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [queryClient]);
}

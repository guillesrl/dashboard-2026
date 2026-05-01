import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ORDERS_KEYS, RESERVATIONS_KEYS } from '@/hooks/use-queries';
import { toast } from '@/hooks/use-toast';

export function useRealtime() {
  const queryClient = useQueryClient();
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  useEffect(() => {
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.all });

          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as any;
            toast({
              title: "Nuevo pedido",
              description: `${newOrder.nombre} - $${newOrder.total}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Pedido actualizado",
              description: `Estado cambiado a ${(payload.new as any).status}`,
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
        (payload) => {
          queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEYS.all });

          if (payload.eventType === 'INSERT') {
            const newRes = payload.new as any;
            toast({
              title: "Nueva reserva",
              description: `${newRes.customer_name} - ${newRes.people} personas`,
            });
          }
        }
      )
      .subscribe();

    channelsRef.current = [ordersChannel, reservationsChannel];

    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [queryClient]);
}

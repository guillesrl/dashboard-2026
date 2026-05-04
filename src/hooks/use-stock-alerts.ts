import { useMemo } from 'react';
import { useMenu } from '@/hooks/use-queries';
import { MenuItem } from '@/services/menuService';

export const STOCK_LOW_THRESHOLD = 5;

export interface StockAlert {
  item: MenuItem;
  level: 'critical' | 'low';
}

export function useStockAlerts() {
  const { data: menuItems = [] } = useMenu();

  const alerts = useMemo<StockAlert[]>(() => {
    return menuItems
      .filter(item => item.stock < STOCK_LOW_THRESHOLD && (item.price ?? 0) > 0)
      .map(item => ({
        item,
        level: item.stock === 0 ? 'critical' : 'low',
      }))
      .sort((a, b) => a.item.stock - b.item.stock);
  }, [menuItems]);

  return {
    alerts,
    criticalCount: alerts.filter(a => a.level === 'critical').length,
    lowCount: alerts.filter(a => a.level === 'low').length,
    totalAlerts: alerts.length,
  };
}

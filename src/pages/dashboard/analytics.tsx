import { useMemo } from "react";
import SalesByHourChart from "@/components/analytics/SalesByHourChart";
import { OrdersByStatusChart } from "@/components/analytics/OrdersByStatusChart";
import { TopDishesChart } from "@/components/analytics/TopDishesChart";
import { ReservationsVsOrdersChart } from "@/components/analytics/ReservationsVsOrdersChart";
import { useOrders } from "@/hooks/use-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Star, Clock, XCircle } from "lucide-react";

export default function AnalyticsPage() {
  const { data: orders = [] } = useOrders();

  const kpis = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthOrders = orders.filter(o => {
      const d = new Date(o.created_at || '');
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalSales = monthOrders.reduce((sum, o) => sum + (typeof o.total === 'number' ? o.total : parseFloat(o.total || '0')), 0);
    const avgTicket = monthOrders.length > 0 ? totalSales / monthOrders.length : 0;

    const cancelled = monthOrders.filter(o => o.status === 'cancelled').length;
    const cancellationRate = monthOrders.length > 0 ? (cancelled / monthOrders.length) * 100 : 0;

    const dishCount: Record<string, number> = {};
    monthOrders.forEach(o => {
      if (Array.isArray(o.items)) {
        o.items.forEach(i => {
          dishCount[i.name] = (dishCount[i.name] || 0) + (i.quantity || 1);
        });
      }
    });
    const topDish = Object.entries(dishCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    const hourCount: Record<string, number> = {};
    monthOrders.forEach(o => {
      if (o.time) {
        const hour = o.time.split(':')[0];
        hourCount[hour] = (hourCount[hour] || 0) + 1;
      }
    });
    const peakHour = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    return { avgTicket, topDish, peakHour, cancellationRate };
  }, [orders]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Analíticas</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Ticket Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.avgTicket.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Mes actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              Plato Estrella
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{kpis.topDish}</div>
            <p className="text-xs text-muted-foreground">Más vendido del mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Hora Pico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.peakHour !== '-' ? `${kpis.peakHour}:00` : '-'}</div>
            <p className="text-xs text-muted-foreground">Mayor volumen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-muted-foreground" />
              Tasa Cancelación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.cancellationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Mes actual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 5 platos más vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <TopDishesChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pedidos por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersByStatusChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reservas vs Pedidos — últimos 30 días</CardTitle>
          </CardHeader>
          <CardContent>
            <ReservationsVsOrdersChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas por día (mes actual)</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesByHourChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

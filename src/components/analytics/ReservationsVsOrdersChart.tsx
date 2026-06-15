import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { OrdersService } from "@/services/ordersService";
import { ReservationsService } from "@/services/reservationsService";

interface DayData {
  day: string;
  pedidos: number;
  reservas: number;
}

const COLOR_PEDIDOS = "#3b82f6";
const COLOR_RESERVAS = "#ef4444";

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid hsl(var(--border))",
  fontSize: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

export function ReservationsVsOrdersChart() {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([OrdersService.getAll(), ReservationsService.getAll()])
      .then(([orders, reservations]) => {
        // Construir mapa de los últimos 30 días
        const days: Record<string, { pedidos: number; reservas: number }> = {};
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split("T")[0];
          days[key] = { pedidos: 0, reservas: 0 };
        }

        orders.forEach((order) => {
          const key = (order.created_at || "").split("T")[0];
          if (days[key]) days[key].pedidos++;
        });

        reservations.forEach((res) => {
          const key = res.date;
          if (days[key]) days[key].reservas++;
        });

        setData(
          Object.entries(days).map(([date, counts]) => ({
            day: new Date(date + "T12:00:00").getDate().toString(),
            ...counts,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-sm text-muted-foreground py-8">Cargando...</div>;

  const hasData = data.some((d) => d.pedidos > 0 || d.reservas > 0);
  if (!hasData) return <div className="text-center text-sm text-muted-foreground py-8">Sin datos en los últimos 30 días</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradPedidos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR_PEDIDOS} stopOpacity={0.25} />
            <stop offset="100%" stopColor={COLOR_PEDIDOS} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradReservas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR_RESERVAS} stopOpacity={0.25} />
            <stop offset="100%" stopColor={COLOR_RESERVAS} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          minTickGap={16}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} />
        <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => `Día ${v}`} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Area
          type="monotone"
          dataKey="pedidos"
          stroke={COLOR_PEDIDOS}
          strokeWidth={2}
          fill="url(#gradPedidos)"
          name="Pedidos"
          activeDot={{ r: 5 }}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="reservas"
          stroke={COLOR_RESERVAS}
          strokeWidth={2}
          fill="url(#gradReservas)"
          name="Reservas"
          activeDot={{ r: 5 }}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

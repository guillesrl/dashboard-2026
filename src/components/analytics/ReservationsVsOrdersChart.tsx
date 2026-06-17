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
import { DateRange, toISODate } from "@/lib/dateRange";

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

export function ReservationsVsOrdersChart({ range }: { range: DateRange }) {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([OrdersService.getAll(), ReservationsService.getAll()])
      .then(([orders, reservations]) => {
        // Construir buckets por día dentro del rango seleccionado
        const days: Record<string, { pedidos: number; reservas: number }> = {};
        const order: string[] = [];
        const cur = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate());
        const last = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate());
        while (cur <= last) {
          const key = toISODate(cur);
          days[key] = { pedidos: 0, reservas: 0 };
          order.push(key);
          cur.setDate(cur.getDate() + 1);
        }

        orders.forEach((o) => {
          const key = (o.created_at || "").split("T")[0];
          if (days[key]) days[key].pedidos++;
        });

        reservations.forEach((res) => {
          if (days[res.date]) days[res.date].reservas++;
        });

        setData(
          order.map((date) => {
            const d = new Date(`${date}T12:00:00`);
            return { day: `${d.getDate()}/${d.getMonth() + 1}`, ...days[date] };
          })
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return <div className="text-center text-sm text-muted-foreground py-8">Cargando...</div>;

  const hasData = data.some((d) => d.pedidos > 0 || d.reservas > 0);
  if (!hasData) return <div className="text-center text-sm text-muted-foreground py-8">Sin datos en el periodo</div>;

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

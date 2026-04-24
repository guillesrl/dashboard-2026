import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
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

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis allowDecimals={false} />
        <Tooltip labelFormatter={(v) => `Día ${v}`} />
        <Legend />
        <Line
          type="monotone"
          dataKey="pedidos"
          stroke="#3498db"
          strokeWidth={2}
          name="Pedidos"
          activeDot={{ r: 6 }}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="reservas"
          stroke="#e74c3c"
          strokeWidth={2}
          name="Reservas"
          activeDot={{ r: 6 }}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

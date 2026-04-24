import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { OrdersService } from "@/services/ordersService";

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  preparing: "#3b82f6",
  ready: "#22c55e",
  delivered: "#6b7280",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

interface StatusCount {
  status: string;
  label: string;
  count: number;
}

export function OrdersByStatusChart() {
  const [data, setData] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrdersService.getAll()
      .then((orders) => {
        const counts: Record<string, number> = {};
        orders.forEach((order) => {
          const s = order.status || "pending";
          counts[s] = (counts[s] || 0) + 1;
        });
        const chartData = Object.entries(counts).map(([status, count]) => ({
          status,
          label: STATUS_LABELS[status] || status,
          count,
        }));
        setData(chartData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Sin datos de pedidos aún
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(value: number) => [value, "Pedidos"]} />
        <Bar dataKey="count" name="Pedidos" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.status}
              fill={STATUS_COLORS[entry.status] || "#6b7280"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

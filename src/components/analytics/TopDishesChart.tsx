import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { OrdersService } from "@/services/ordersService";
import { DateRange, inRange } from "@/lib/dateRange";

interface DishCount {
  name: string;
  quantity: number;
}

export function TopDishesChart({ range }: { range: DateRange }) {
  const [data, setData] = useState<DishCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    OrdersService.getAll()
      .then((orders) => {
        const counts: Record<string, number> = {};
        orders
          .filter((order) => inRange(order.created_at, range))
          .forEach((order) => {
          (order.items || []).forEach((item) => {
            counts[item.name] = (counts[item.name] || 0) + item.quantity;
          });
        });
        const sorted = Object.entries(counts)
          .map(([name, quantity]) => ({ name, quantity }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
        setData(sorted);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Sin pedidos con items registrados aún
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value: number) => [value, "Unidades"]} />
        <Bar
          dataKey="quantity"
          fill="#8b5cf6"
          radius={[0, 4, 4, 0]}
          name="Unidades vendidas"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Definimos el tipo de dato
export interface SalesData {
  hour: string;
  sales: number;
}

export const SalesByHourChart: React.FC = () => {
  const { data, isLoading, error } = useQuery<SalesData[]>({
    queryKey: ['salesByHour'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/sales-by-hour');
      if (!res.ok) {
        throw new Error('Error al obtener datos de ventas por hora');
      }
      return res.json();
    },
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#3498db"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
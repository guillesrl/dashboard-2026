import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Definimos el tipo de dato para ventas por día
export interface SalesData {
  date: string;
  sales: number;
}

const SalesByHourChart: React.FC = () => {
  const { data, isLoading, error } = useQuery<SalesData[]>({
    queryKey: ['salesByDay'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/sales-by-hour');
      if (!res.ok) {
        throw new Error('Error al obtener datos de ventas mensuales');
      }
      return res.json();
    },
  });

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Extraer solo el día para mostrar en el eje X (1, 2, 3...)
  const chartData = data?.map(item => ({
    ...item,
    day: new Date(item.date).getDate().toString()
  })) || [];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} style={{ backgroundColor: 'transparent' }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis tickFormatter={(value) => `€${value}`} />
        <Tooltip
          labelFormatter={(value) => `Día ${value}`}
          formatter={(value: number) => [`€${value.toFixed(2)}`, 'Ventas']}
        />
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

export default SalesByHourChart;
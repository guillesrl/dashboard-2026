import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DateRange, toISODate } from '@/lib/dateRange';

// Definimos el tipo de dato para ventas por día
export interface SalesData {
  date: string;
  sales: number;
}

const COLOR_VENTAS = '#10b981';

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid hsl(var(--border))',
  fontSize: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const SalesByHourChart: React.FC<{ range: DateRange }> = ({ range }) => {
  const from = toISODate(range.from);
  const to = toISODate(range.to);
  const { data, isLoading, error } = useQuery<SalesData[]>({
    queryKey: ['salesByDay', from, to],
    queryFn: async () => {
      const token = localStorage.getItem('dashboard_token');
      const res = await fetch(`/api/analytics/sales-by-hour?from=${from}&to=${to}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error('Error al obtener datos de ventas');
      }
      return res.json();
    },
  });

  if (isLoading) return <div className="text-center text-sm text-muted-foreground py-8">Cargando...</div>;
  if (error) return <div className="text-center text-sm text-destructive py-8">Error: {error.message}</div>;

  // Etiqueta de eje X como D/M (evita ambigüedad entre meses)
  const chartData = data?.map(item => {
    const d = new Date(`${item.date}T12:00:00`);
    return { ...item, day: `${d.getDate()}/${d.getMonth() + 1}` };
  }) || [];

  if (chartData.every(d => !d.sales)) {
    return <div className="text-center text-sm text-muted-foreground py-8">Sin ventas este mes</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR_VENTAS} stopOpacity={0.3} />
            <stop offset="100%" stopColor={COLOR_VENTAS} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={16} />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={44}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(value) => `Día ${value}`}
          formatter={(value: number) => [`€${value.toFixed(2)}`, 'Ventas']}
        />
        <Area
          type="monotone"
          dataKey="sales"
          stroke={COLOR_VENTAS}
          strokeWidth={2}
          fill="url(#gradVentas)"
          activeDot={{ r: 6 }}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SalesByHourChart;

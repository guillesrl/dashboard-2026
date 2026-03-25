import SalesByHourChart from '../../components/analytics/SalesByHourChart';

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analíticas de Ventas Mensuales</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <SalesByHourChart />
      </div>
    </div>
  );
}
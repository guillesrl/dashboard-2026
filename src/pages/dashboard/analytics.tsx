import SalesByHourChart from "@/components/analytics/SalesByHourChart";
import { OrdersByStatusChart } from "@/components/analytics/OrdersByStatusChart";
import { TopDishesChart } from "@/components/analytics/TopDishesChart";
import { ReservationsVsOrdersChart } from "@/components/analytics/ReservationsVsOrdersChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analíticas</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas por día (mes actual)</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesByHourChart />
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
            <CardTitle className="text-base">Top 5 platos más vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <TopDishesChart />
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
      </div>
    </div>
  );
}

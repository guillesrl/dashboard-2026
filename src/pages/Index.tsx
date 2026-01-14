import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuManagement } from "@/components/MenuManagement";
import { OrdersManagement } from "@/components/OrdersManagement";
import { ReservationsManagement } from "@/components/ReservationsManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ShoppingCart, Calendar, TrendingUp, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { MenuService } from "@/services/menuService";
import { OrdersService } from "@/services/ordersService";
import { ReservationsService } from "@/services/reservationsService";

const Index = () => {
  const [activeTab, setActiveTab] = useState("menu");
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState({
    totalSales: 0,
    monthlySales: 0,
    activeOrders: 0,
    monthlyOrders: 0,
    todayReservations: 0,
    monthlyReservations: 0,
    menuItems: 0,
    unavailableItems: 0,
  });

  useEffect(() => {
    loadStats();
    
    // Auto-refresh cada 1 minuto (60000 ms)
    const interval = setInterval(() => {
      loadStats();
    }, 60000);
    
    // Limpiar el interval cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  // Función para parsear números que pueden tener coma o punto decimal (formato europeo vs americano)
  const parseNumber = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;

    // Convertir a string y reemplazar coma por punto para parsear correctamente
    const stringValue = String(value).replace(',', '.');
    const parsed = parseFloat(stringValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const loadStats = async () => {
    try {
      // Get menu items
      const menuData = await MenuService.getAll();

      // Count total menu items and unavailable items
      const itemsWithPrice = menuData.filter(item => item.price && item.price > 0);
      const menuCount = itemsWithPrice.length;
      const unavailableItems = itemsWithPrice.filter(item => {
        return item.stock < 1 || !item.available;
      }).length;

      // Get all orders
      const ordersData = await OrdersService.getAll();
      const todayOrders = await OrdersService.getToday();
      const monthlyOrdersData = await OrdersService.getThisMonth();
      const activeOrdersData = await OrdersService.getActive();

      // Get today's reservations
      const todayReservations = await ReservationsService.getToday();
      const monthlyReservationsData = await ReservationsService.getThisMonth();

      // Calculate total sales from today's orders
      const totalSales = todayOrders.reduce((sum, order) => sum + parseNumber(order.total), 0);
      
      // Calculate monthly sales and orders
      const monthlySales = monthlyOrdersData.reduce((sum, order) => sum + parseNumber(order.total), 0);
      const monthlyOrders = monthlyOrdersData.length;
      
      // Count all active orders (not delivered or cancelled)
      const activeOrders = activeOrdersData.length;

      setStats({
        totalSales,
        monthlySales,
        activeOrders,
        monthlyOrders,
        todayReservations: todayReservations.length,
        monthlyReservations: monthlyReservationsData.length,
        menuItems: menuCount,
        unavailableItems: unavailableItems,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChefHat className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Restaurant Dashboard</h1>
                <p className="text-muted-foreground">Sistema de gestión integral para restaurantes</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total de pedidos del día</p>
              <div className="mt-2 pt-2 border-t">
                <div className="text-sm font-semibold text-muted-foreground">Mes: ${stats.monthlySales.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Activos</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">Pendientes de entrega</p>
              <div className="mt-2 pt-2 border-t">
                <div className="text-sm font-semibold text-muted-foreground">Mes: {stats.monthlyOrders} pedidos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayReservations}</div>
              <p className="text-xs text-muted-foreground">Reservas confirmadas</p>
              <div className="mt-2 pt-2 border-t">
                <div className="text-sm font-semibold text-muted-foreground">Mes: {stats.monthlyReservations} reservas</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platos del Menú</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.menuItems}</div>
              <p className="text-xs text-muted-foreground">Total de platos disponibles</p>
              <div className="mt-2 pt-2 border-t">
                <div className="text-sm font-semibold text-muted-foreground">No disponibles: {stats.unavailableItems}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content - Tabs */}
      <div className="container mx-auto px-4 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Menú
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reservas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-4">
            <MenuManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4">
            <ReservationsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

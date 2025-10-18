import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuManagement } from "@/components/MenuManagement";
import { OrdersManagement } from "@/components/OrdersManagement";
import { ReservationsManagement } from "@/components/ReservationsManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ShoppingCart, Calendar, TrendingUp, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [activeTab, setActiveTab] = useState("menu");
  const { theme, setTheme } = useTheme();
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrders: 0,
    todayReservations: 0,
    menuItems: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get menu items count
      const { count: menuCount } = await supabase
        .from('menu')
        .select('*', { count: 'exact', head: true });

      // Get all orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total, status, created_at');

      // Get today's date for reservations
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's reservations
      const { count: reservationsCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      // Calculate total sales from today's orders
      const todayOrders = ordersData?.filter(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        return orderDate === today;
      }) || [];
      
      const totalSales = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);
      
      // Count all active orders (not delivered or cancelled)
      const activeOrders = ordersData?.filter(
        order => order.status !== 'delivered' && order.status !== 'cancelled'
      ).length || 0;

      setStats({
        totalSales,
        activeOrders,
        todayReservations: reservationsCount || 0,
        menuItems: menuCount || 0,
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items en Menú</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.menuItems}</div>
              <p className="text-xs text-muted-foreground">Total de platos disponibles</p>
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

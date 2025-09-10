import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuManagement } from "@/components/MenuManagement";
import { OrdersManagement } from "@/components/OrdersManagement";
import { ReservationsManagement } from "@/components/ReservationsManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ShoppingCart, Calendar, TrendingUp } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("menu");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Restaurant Dashboard</h1>
              <p className="text-muted-foreground">Sistema de gestión integral para restaurantes</p>
            </div>
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
              <div className="text-2xl font-bold">$1,234</div>
              <p className="text-xs text-muted-foreground">+12% desde ayer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Órdenes Activas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">3 pendientes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">5 confirmadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Items en Menú</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">3 nuevos esta semana</p>
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
              Órdenes
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

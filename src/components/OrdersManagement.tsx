import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
  items: any;
  total: number;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    address: "",
    items: [] as OrderItem[]
  });
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState("1");

  const statusOptions = [
    { value: "pending", label: "Pendiente", color: "bg-yellow-500" },
    { value: "preparing", label: "Preparando", color: "bg-blue-500" },
    { value: "ready", label: "Listo", color: "bg-green-500" },
    { value: "delivered", label: "Entregado", color: "bg-gray-500" },
    { value: "cancelled", label: "Cancelado", color: "bg-red-500" }
  ];

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      console.error("Error loading menu items:", error);
    }
  };

  const handleAddItem = () => {
    if (!selectedItem || !quantity) return;

    const menuItem = menuItems.find(item => item.id.toString() === selectedItem);
    if (!menuItem) return;

    const newItem: OrderItem = {
      name: menuItem.nombre || "",
      quantity: parseInt(quantity),
      price: parseFloat(menuItem.precio || "0")
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
    setSelectedItem("");
    setQuantity("1");
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast({
        title: "Error",
        description: "Añade al menos un item a la orden",
        variant: "destructive"
      });
      return;
    }

    try {
      const orderData = {
        nombre: formData.customer_name,
        telefono: formData.phone,
        direccion: formData.address,
        items: formData.items as any,
        total: calculateTotal(),
        status: 'pendiente'
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Orden creada correctamente"
      });

      setDialogOpen(false);
      resetForm();
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la orden",
        variant: "destructive"
      });
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Estado actualizado correctamente"
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: "",
      phone: "",
      address: "",
      items: []
    });
    setSelectedItem("");
    setQuantity("1");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'preparing': return <AlertCircle className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando órdenes...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestión de Órdenes</CardTitle>
            <CardDescription>Administra los pedidos del restaurante</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Orden
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nueva Orden</DialogTitle>
                <DialogDescription>
                  Crea una nueva orden de delivery
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Nombre del Cliente</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Añadir Items</Label>
                  <div className="flex gap-2">
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecciona un platillo" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuItems.map(item => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.nombre} - ${item.precio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-20"
                      placeholder="Cant."
                    />
                    <Button type="button" onClick={handleAddItem}>
                      Añadir
                    </Button>
                  </div>
                </div>

                {formData.items.length > 0 && (
                  <div className="space-y-2">
                    <Label>Items de la Orden</Label>
                    <div className="border rounded-lg p-2">
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <span>{item.quantity}x {item.name}</span>
                          <div className="flex items-center gap-2">
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2 font-bold">
                        Total: ${calculateTotal().toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Crear Orden
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No hay órdenes registradas
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.nombre}</TableCell>
                  <TableCell>{order.telefono}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {Array.isArray(order.items) ? (
                        order.items.map((item: any, idx: number) => (
                          <div key={idx}>{item.quantity}x {item.name}</div>
                        ))
                      ) : (
                        <div>Items no disponibles</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>${typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>
                    <Badge className={`${statusOptions.find(s => s.value === order.status)?.color}`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {statusOptions.find(s => s.value === order.status)?.label}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={order.status}
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from "react";
import { OrdersService, Order, OrderItem } from "@/services/ordersService";
import { MenuService } from "@/services/menuService";
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


export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
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

  const formatDateForDisplay = (dateString: string | null): string => {
    if (!dateString) return '--/--/----';

    try {
      // Si ya está en formato YYYY-MM-DD, convertir a DD/MM/YYYY
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateString.split('-');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }

      // Si es formato ISO completo (YYYY-MM-DDTHH:MM:SS), extraer solo la fecha
      if (dateString.includes('T')) {
        const datePart = dateString.split('T')[0];
        if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = datePart.split('-');
          return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
        }
      }

      // Si es otro formato, intentar parsear como fecha
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '--/--/----' : date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '--/--/----';
    }
  };

  const formatTimeForDisplay = (timeString: string | null): string => {
    // El campo time ya viene en formato HH:MM como "16:07"
    return timeString || '--:--';
  };

  const processOrderData = (orderData: any): Order => {
    // Procesar items si vienen como string
    let processedItems: OrderItem[] = [];
    if (Array.isArray(orderData.items)) {
      processedItems = orderData.items;
    } else if (typeof orderData.items === 'string') {
      try {
        processedItems = JSON.parse(orderData.items);
      } catch {
        processedItems = [];
      }
    }

    return {
      id: orderData.id,
      customer_name: orderData.customer_name || orderData.nombre || '',
      customer_phone: orderData.customer_phone || orderData.telefono || '',
      customer_email: orderData.customer_email || '',
      items: processedItems,
      total: typeof orderData.total === 'number' ? orderData.total : parseNumber(orderData.total),
      status: orderData.status || 'pending',
      notes: orderData.notes || '',
      created_at: orderData.created_at || null,
      time: orderData.time || null,
      order_datetime: orderData.order_datetime || null,
      updated_at: orderData.updated_at || null
    };
  };

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
    
    // Auto-refresh cada 5 minutos (300000 ms)
    const interval = setInterval(() => {
      fetchOrders();
    }, 300000);
    
    // Limpiar el interval cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await OrdersService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const data = await MenuService.getAll();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleAddItem = () => {
    if (!selectedItem || !quantity) return;

    const menuItem = menuItems.find(item => item.id.toString() === selectedItem);
    if (!menuItem) return;

    const newItem: OrderItem = {
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: parseInt(quantity)
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
      const now = new Date();

      // Formatear fecha en formato YYYY-MM-DD
      const formattedDate = now.toISOString().split('T')[0];

      // Formatear hora como HH:MM
      const formattedTime = now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const orderData = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        items: formData.items,
        total: calculateTotal(),
        status: 'pending' as const,
        notes: ''
      };

      await OrdersService.create(orderData);
      
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

  const updateOrderStatus = async (orderId: number, newStatus: Order['status']) => {
    try {
      await OrdersService.updateStatus(orderId, newStatus);

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
      customer_phone: "",
      customer_email: "",
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
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const parseNumber = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;

    // Convertir a string y reemplazar coma por punto para parsear correctamente
    const stringValue = String(value).replace(',', '.');
    const parsed = parseFloat(stringValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  if (loading) {
    return <div className="text-center py-8">Cargando pedidos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Pedidos</CardTitle>
            <CardDescription>Administra los pedidos</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nuevo Pedido</DialogTitle>
                <DialogDescription>
                  Crea un nuevo pedido de delivery
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
                    <Label htmlFor="customer_phone">Teléfono</Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="customer_email">Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
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
                            {item.name} - ${item.price}
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
                    <Label>Items del Pedido</Label>
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
                    Crear Pedido
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
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No hay pedidos registrados
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.customer_name}</TableCell>
                  <TableCell>{order.customer_phone}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {Array.isArray(order.items) && order.items.length > 0 ? (
                        order.items.map((item: OrderItem, idx: number) => (
                          <div key={idx}>{item.quantity}x {item.name}</div>
                        ))
                      ) : (
                        <div className="text-muted-foreground">Items no disponibles</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>${parseNumber(order.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={`${statusOptions.find(s => s.value === order.status)?.color || 'bg-gray-500'}`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status || 'pending')}
                        {statusOptions.find(s => s.value === order.status)?.label || 'Pendiente'}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDateForDisplay(order.created_at)}
                  </TableCell>
                  <TableCell>
                    {formatTimeForDisplay(order.time)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={order.status}
                      onValueChange={(value: Order['status']) => updateOrderStatus(order.id, value)}
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
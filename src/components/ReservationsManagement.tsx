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
import { Plus, Calendar, Clock, Users, Phone, CheckCircle, XCircle } from "lucide-react";

interface Reservation {
  id: number;
  customer_name: string;
  phone: string;
  date: string;
  time: string;
  people: number;
  table_number: number | null;
  status: string;
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export function ReservationsManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    date: "",
    time: "",
    people: "2",
    table_number: "",
    status: "confirmed"
  });

  const statusOptions = [
    { value: "confirmed", label: "Confirmada", color: "bg-green-500" },
    { value: "pending", label: "Pendiente", color: "bg-yellow-500" },
    { value: "cancelled", label: "Cancelada", color: "bg-red-500" },
    { value: "completed", label: "Completada", color: "bg-gray-500" }
  ];

  useEffect(() => {
    fetchReservations();
    
    // Auto-refresh cada 1 minuto (60000 ms)
    const interval = setInterval(() => {
      fetchReservations();
    }, 60000);
    
    // Limpiar el interval cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setReservations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const reservationData = {
        customer_name: formData.customer_name,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        people: parseInt(formData.people),
        table_number: formData.table_number ? parseInt(formData.table_number) : null,
        status: formData.status
      };

      const { error } = await supabase
        .from('reservations')
        .insert([reservationData]);

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Reserva creada correctamente"
      });

      setDialogOpen(false);
      resetForm();
      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la reserva",
        variant: "destructive"
      });
    }
  };

  const updateReservationStatus = async (id: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Estado actualizado correctamente"
      });
      fetchReservations();
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
      date: "",
      time: "",
      people: "2",
      table_number: "",
      status: "confirmed"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando reservas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestión de Reservas</CardTitle>
            <CardDescription>Administra las reservas del restaurante</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nueva Reserva</DialogTitle>
                <DialogDescription>
                  Registra una nueva reserva
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="people">Número de Personas</Label>
                    <Input
                      id="people"
                      type="number"
                      min="1"
                      value={formData.people}
                      onChange={(e) => setFormData({...formData, people: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="table">Mesa (opcional)</Label>
                    <Input
                      id="table"
                      type="number"
                      value={formData.table_number}
                      onChange={(e) => setFormData({...formData, table_number: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Crear Reserva
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
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Personas</TableHead>
              <TableHead>Mesa</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No hay reservas registradas
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.customer_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(reservation.date).toLocaleDateString('es-ES')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {reservation.time.substring(0, 5)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {reservation.people}
                    </div>
                  </TableCell>
                  <TableCell>{reservation.table_number || '-'}</TableCell>
                  <TableCell>
                    {reservation.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {reservation.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusOptions.find(s => s.value === reservation.status)?.color}`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(reservation.status)}
                        {statusOptions.find(s => s.value === reservation.status)?.label}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={reservation.status}
                      onValueChange={(value) => updateReservationStatus(reservation.id, value)}
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
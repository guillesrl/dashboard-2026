import { useState, useEffect, useRef, useCallback } from "react";
import { ReservationsService, Reservation } from "@/services/reservationsService";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { apiCallManager } from "@/lib/apiCallManager";


export function ReservationsManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  // Establecer fecha actual por defecto en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const [filterDate, setFilterDate] = useState(today);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    date: "",
    time: "",
    guests: "2",
    status: "confirmed" as const,
    notes: ""
  });
  const isInitialized = useRef(false);
  const isMobile = useIsMobile();

  const statusOptions = [
    { value: "confirmed", label: "Confirmada", color: "bg-green-500" },
    { value: "pending", label: "Pendiente", color: "bg-yellow-500" },
    { value: "cancelled", label: "Cancelada", color: "bg-red-500" },
    { value: "completed", label: "Completada", color: "bg-gray-500" }
  ];

  useEffect(() => {
    if (!apiCallManager.shouldFetchReservations()) return;
    
    // Llamada inicial única - SIN AUTO-REFRESH
    fetchReservations();
  }, []);

  const fetchReservations = useCallback(async () => {
    try {
      const data = await ReservationsService.getAll();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const reservationData = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        date: formData.date,
        time: formData.time,
        guests: parseInt(formData.guests),
        status: formData.status,
        notes: formData.notes
      };

      await ReservationsService.create(reservationData);
      
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

  const updateReservationStatus = async (id: number, newStatus: Reservation['status']) => {
    try {
      await ReservationsService.updateStatus(id, newStatus);

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
      customer_phone: "",
      date: "",
      time: "",
      guests: "2",
      status: "confirmed" as const,
      notes: ""
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  // Filtrar y ordenar reservas por la fecha seleccionada
  const filteredReservations = reservations
    .filter(reservation => {
      // Siempre hay filtro, mostrar solo las del día seleccionado (por defecto hoy)
      
      // Manejar diferentes formatos de fecha
      const reservationDate = reservation.date;
      
      // Si reservation.date es un string en formato ISO, usar la misma lógica que la tabla
      if (typeof reservationDate === 'string') {
        // Convertir a Date y luego a formato local (como lo hace la tabla)
        const localDate = new Date(reservationDate);
        const localDateString = localDate.toLocaleDateString('es-ES');
        
        // Convertir el filtro al mismo formato
        const filterDateObj = new Date(filterDate);
        const filterDateString = filterDateObj.toLocaleDateString('es-ES');
        
        return localDateString === filterDateString;
      }
      
      // Si es un objeto Date
      if (reservationDate && typeof reservationDate === 'object' && 'toLocaleDateString' in reservationDate) {
        const localDateString = (reservationDate as Date).toLocaleDateString('es-ES');
        const filterDateObj = new Date(filterDate);
        const filterDateString = filterDateObj.toLocaleDateString('es-ES');
        
        return localDateString === filterDateString;
      }
      
      return false;
    })
    .sort((a, b) => {
      // Primero ordenar por fecha (más reciente primero)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const dateComparison = dateB.getTime() - dateA.getTime();
      
      if (dateComparison !== 0) {
        return dateComparison;
      }
      
      // Si las fechas son iguales, ordenar por hora (más temprana a más tardía)
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });

  if (loading) {
    return <div className="text-center py-8">Cargando reservas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className={`flex justify-between items-center ${isMobile ? 'flex-col gap-4' : ''}`}>
          <div>
            <CardTitle>Reservas</CardTitle>
            <CardDescription>Administra las reservas</CardDescription>
          </div>
          <div className={`flex items-center gap-4 ${isMobile ? 'w-full justify-between' : ''}`}>
            <div className={`flex items-center gap-2 ${isMobile ? 'flex-1' : ''}`}>
              <Label htmlFor="filterDate" className="whitespace-nowrap">Filtrar por fecha:</Label>
              <Input
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className={isMobile ? 'flex-1' : 'w-[180px]'}
              />
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {isMobile ? '' : 'Nueva Reserva'}
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
                  <Label htmlFor="customer_phone">Teléfono</Label>
                  <Input
                    id="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
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
                    <Label htmlFor="guests">Número de Personas</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      value={formData.guests}
                      onChange={(e) => setFormData({...formData, guests: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notas</Label>
                    <Input
                      id="notes"
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
            {filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No hay reservas para la fecha seleccionada
                </TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((reservation) => (
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
                      {reservation.guests}
                    </div>
                  </TableCell>
                  <TableCell>
                    {reservation.notes || '-'}
                  </TableCell>
                  <TableCell>
                    {reservation.customer_phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {reservation.customer_phone}
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
                      onValueChange={(value: Reservation['status']) => updateReservationStatus(reservation.id, value)}
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
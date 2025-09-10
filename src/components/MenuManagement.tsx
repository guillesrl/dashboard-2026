import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "entrada",
    description: ""
  });

  const categories = [
    { value: "entrada", label: "Entrada" },
    { value: "principal", label: "Plato Principal" },
    { value: "postre", label: "Postre" },
    { value: "bebida", label: "Bebida" }
  ];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los items del menú",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemData = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description
      };

      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Item actualizado correctamente"
        });
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert([itemData]);

        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Item añadido al menú"
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchMenuItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el item",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      description: item.description || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este item?")) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Item eliminado correctamente"
      });
      fetchMenuItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el item",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "entrada",
      description: ""
    });
    setEditingItem(null);
  };

  if (loading) {
    return <div className="text-center py-8">Cargando menú...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Gestión del Menú</CardTitle>
            <CardDescription>Administra los platillos de tu restaurante</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? "Editar Item" : "Nuevo Item"}</DialogTitle>
                <DialogDescription>
                  {editingItem ? "Modifica los datos del platillo" : "Añade un nuevo platillo al menú"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Precio ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingItem ? "Actualizar" : "Crear"}
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
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay items en el menú
                </TableCell>
              </TableRow>
            ) : (
              menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {categories.find(c => c.value === item.category)?.label || item.category}
                  </TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{item.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
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
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  id: number;
  nombre: string | null;
  precio: string | null;
  categoria: string | null;
  ingredientes: string | null;
  stock: string | null;
  Gluten: string | null;
  Vegetariano: string | null;
  Vegano: string | null;
  Lactosa: string | null;
  Marisco: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    categoria: "entrada",
    ingredientes: "",
    stock: ""
  });

  const getCategoryBadge = (categoria: string | null) => {
    // Debug: Log the raw category value
    console.log('Raw category value:', categoria);
    
    // Normalize the category by converting to lowercase and trimming whitespace
    const normalizedCategoria = categoria ? String(categoria).toLowerCase().trim() : '';
    console.log('Normalized category:', normalizedCategoria);
    
    const categoryStyles = {
      entrantes: 'bg-green-100 text-green-800 border-green-200',
      pescados: 'bg-blue-100 text-blue-800 border-blue-200',
      pastas: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      carnes: 'bg-red-100 text-red-800 border-red-200',
      postres: 'bg-purple-100 text-purple-800 border-purple-200',
      default: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    // Map the normalized category to its display name
    const categoryMap: Record<string, {key: keyof typeof categoryStyles, label: string}> = {
      'entrante': { key: 'entrantes', label: 'Entrantes' },
      'pescado': { key: 'pescados', label: 'Pescados' },
      'pasta': { key: 'pastas', label: 'Pastas' },
      'carne': { key: 'carnes', label: 'Carnes' },
      'postre': { key: 'postres', label: 'Postres' },
    };
    
    // Find the matching category or use default
    const matchedCategory = categoryMap[normalizedCategoria] || { key: 'default', label: 'Otro' };
    
    console.log('Matched category:', matchedCategory);
    
    const { key, label } = matchedCategory;

    return (
      <Badge variant="outline" className={`${categoryStyles[key]} capitalize`}>
        {label}
      </Badge>
    );
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      // Filtrar items sin precio
      const itemsWithPrice = (data || []).filter(item => item.precio && item.precio.trim() !== '');
      setMenuItems(itemsWithPrice);
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
        nombre: formData.nombre,
        precio: formData.precio,
        categoria: formData.categoria,
        ingredientes: formData.ingredientes,
        stock: formData.stock
      };

      if (editingItem) {
        const { error } = await supabase
          .from('menu')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Item actualizado correctamente"
        });
      } else {
        const { error } = await supabase
          .from('menu')
          .insert([itemData] as any);

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
      nombre: item.nombre || "",
      precio: item.precio || "",
      categoria: item.categoria || "entrada",
      ingredientes: item.ingredientes || "",
      stock: item.stock || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este item?")) return;

    try {
      const { error } = await supabase
        .from('menu')
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

  const handleStockUpdate = async (id: number, newStock: string) => {
    try {
      const { error } = await supabase
        .from('menu')
        .update({ stock: newStock })
        .eq('id', id);

      if (error) throw error;

      // Update local state immediately for better UX
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, stock: newStock } : item
        )
      );

      toast({
        title: "Éxito",
        description: "Stock actualizado correctamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      precio: "",
      categoria: "entrada",
      ingredientes: "",
      stock: ""
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
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="precio">Precio ($)</Label>
                    <Input
                      id="precio"
                      type="text"
                      value={formData.precio}
                      onChange={(e) => setFormData({...formData, precio: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({...formData, categoria: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrantes">Entrantes</SelectItem>
                        <SelectItem value="pescados">Pescados</SelectItem>
                        <SelectItem value="pastas">Pastas</SelectItem>
                        <SelectItem value="carnes">Carnes</SelectItem>
                        <SelectItem value="postres">Postres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="ingredientes">Ingredientes</Label>
                  <Textarea
                    id="ingredientes"
                    value={formData.ingredientes}
                    onChange={(e) => setFormData({...formData, ingredientes: e.target.value})}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    placeholder="Cantidad en stock"
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
              <TableHead>Stock</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {menuItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay items en el menú
                </TableCell>
              </TableRow>
            ) : (
              menuItems.map((item) => {
                const categoryBadge = getCategoryBadge(item.categoria);
                return (
                  <TableRow key={item.id}> {/* comment Cambia el texto a Rojo si el stock es menor a 1 */}
                    <TableCell className={`font-medium ${item.stock && parseInt(item.stock) < 1 ? 'text-red-500' : ''}`}>
                      <div className="flex items-center gap-2">
                        {item.nombre}
                        {item.stock && parseInt(item.stock) < 1 && (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                       {/* spam de categorias menu */}
                      {categoryBadge}
                    </TableCell>
                    <TableCell>${item.precio}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={item.stock || ''}
                        onChange={(e) => handleStockUpdate(item.id, e.target.value)}
                        className="w-20 h-8 text-center"
                      />
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{item.ingredientes}</TableCell>
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
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
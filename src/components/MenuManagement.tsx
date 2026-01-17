import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { MenuService, MenuItem } from "@/services/menuService";
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


export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "entrada",
    description: "",
    stock: ""
  });

  const getCategoryBadge = (category: string | null) => {
    const normalizedCategory = category ? String(category).toLowerCase().trim() : '';
    
    const categoryStyles = {
      entrantes: 'bg-green-100 text-green-800 border-green-200',
      pescados: 'bg-blue-100 text-blue-800 border-blue-200',
      pastas: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      carnes: 'bg-red-100 text-red-800 border-red-200',
      postres: 'bg-purple-100 text-purple-800 border-purple-200',
      default: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const categoryMap: Record<string, {key: keyof typeof categoryStyles, label: string}> = {
      'entrante': { key: 'entrantes', label: 'Entrantes' },
      'pescado': { key: 'pescados', label: 'Pescados' },
      'pasta': { key: 'pastas', label: 'Pastas' },
      'carne': { key: 'carnes', label: 'Carnes' },
      'postre': { key: 'postres', label: 'Postres' },
    };
    
    const matchedCategory = categoryMap[normalizedCategory] || { key: 'default', label: 'Otro' };
    const { key, label } = matchedCategory;

    return (
      <Badge variant="outline" className={`${categoryStyles[key]} capitalize`}>
        {label}
      </Badge>
    );
  };

  useEffect(() => {
    fetchMenuItems();
    
    // Auto-refresh cada 1 minuto (60000 ms)
    const interval = setInterval(() => {
      fetchMenuItems();
    }, 60000);
    
    // Limpiar el interval cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  const fetchMenuItems = async () => {
    try {
      const data = await MenuService.getAll();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
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
        description: formData.description,
        stock: parseInt(formData.stock),
        available: true
      };

      if (editingItem) {
        await MenuService.update(editingItem.id, itemData);
        toast({
          title: "Éxito",
          description: "Item actualizado correctamente"
        });
      } else {
        await MenuService.create(itemData as Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: "Éxito",
          description: "Item creado correctamente"
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving item:', error);
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
      name: item.name || "",
      price: item.price?.toString() || "",
      category: item.category || "entrada",
      description: item.description || "",
      stock: item.stock?.toString() || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este item?")) return;

    try {
      await MenuService.delete(id);
      toast({
        title: "Éxito",
        description: "Item eliminado correctamente"
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el item",
        variant: "destructive"
      });
    }
  };

  const handleStockUpdate = async (id: number, newStock: string) => {
    try {
      const stockNumber = parseInt(newStock);
      await MenuService.updateStock(id, stockNumber);
      
      // Update local state immediately for better UX
      setMenuItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, stock: stockNumber } : item
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
      name: "",
      price: "",
      category: "entrada",
      description: "",
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
            <CardTitle>Menú</CardTitle>
            <CardDescription>Administra los platos</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Plato
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
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({...formData, category: value})}
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
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                  No hay platos en el menú
                </TableCell>
              </TableRow>
            ) : (
              menuItems.map((item) => {
                const categoryBadge = getCategoryBadge(item.category);
                return (
                  <TableRow key={item.id}>
                    <TableCell className={`font-medium ${item.stock < 1 ? 'text-red-500' : ''}`}>
                      <div className="flex items-center gap-2">
                        {item.name}
                        {item.stock < 1 && (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {categoryBadge}
                    </TableCell>
                    <TableCell>${item.price}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.stock}
                        onChange={(e) => handleStockUpdate(item.id!, e.target.value)}
                        className="w-20 h-8 text-center"
                      />
                    </TableCell>
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
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
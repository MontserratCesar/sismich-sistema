import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye,
  MapPin,
  Calendar,
  User,
  DollarSign,
  CheckCircle2,
  X
} from 'lucide-react';
import type { Obra, User as UserType, ObraAmbito, TipoRecurso, EstadoObra } from '@/types';

interface ObrasManagerProps {
  obras: Obra[];
  users: UserType[];
  currentUser: UserType;
  onCreate: (obra: Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, obra: Partial<Obra>) => void;
  onDelete: (id: string) => void;
  onViewDetail: (obra: Obra) => void;
}

const emptyObra: Omit<Obra, 'id' | 'createdAt' | 'updatedAt'> = {
  nombre: '',
  ubicacion: '',
  ambito: 'publica',
  fechaInicio: '',
  fechaTermino: '',
  tipoRecurso: 'propio',
  residenteId: '',
  estado: 'activa',
  presupuesto: 0,
};

export function ObrasManager({ obras, users, currentUser, onCreate, onUpdate, onDelete, onViewDetail }: ObrasManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [formData, setFormData] = useState(emptyObra);

  const residentes = users.filter(u => u.role === 'residente' && u.isActive);

  const filteredObras = obras.filter(obra => {
    const matchesSearch = obra.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obra.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentUser.role === 'admin') {
      return matchesSearch;
    }
    return matchesSearch && obra.residenteId === currentUser.id;
  });

  const obrasActivas = filteredObras.filter(o => o.estado === 'activa');
  const obrasTerminadas = filteredObras.filter(o => o.estado === 'terminada');

  const handleOpenDialog = (obra?: Obra) => {
    if (obra) {
      setEditingObra(obra);
      setFormData({
        nombre: obra.nombre,
        ubicacion: obra.ubicacion,
        ambito: obra.ambito,
        fechaInicio: obra.fechaInicio,
        fechaTermino: obra.fechaTermino,
        tipoRecurso: obra.tipoRecurso,
        residenteId: obra.residenteId,
        estado: obra.estado,
        presupuesto: obra.presupuesto,
      });
    } else {
      setEditingObra(null);
      setFormData({
        ...emptyObra,
        residenteId: currentUser.role === 'residente' ? currentUser.id : residentes[0]?.id || '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingObra) {
      onUpdate(editingObra.id, formData);
    } else {
      onCreate(formData);
    }
    setIsDialogOpen(false);
    setFormData(emptyObra);
    setEditingObra(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta obra? Esta acción no se puede deshacer.')) {
      onDelete(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const ObraCard = ({ obra }: { obra: Obra }) => {
    const residente = users.find(u => u.id === obra.residenteId);
    return (
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-gray-900">{obra.nombre}</h3>
                <Badge variant={obra.estado === 'activa' ? 'default' : 'secondary'}>
                  {obra.estado}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <MapPin className="w-4 h-4" />
                {obra.ubicacion}
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onViewDetail(obra)}>
                <Eye className="w-4 h-4" />
              </Button>
              {(currentUser.role === 'admin' || currentUser.id === obra.residenteId) && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(obra)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {currentUser.role === 'admin' && (
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(obra.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Inicio: {new Date(obra.fechaInicio).toLocaleDateString('es-MX')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Término: {new Date(obra.fechaTermino).toLocaleDateString('es-MX')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Residente: {residente?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Presupuesto: {formatCurrency(obra.presupuesto)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {obra.ambito === 'publica' ? 'Pública' : 'Privada'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {obra.tipoRecurso === 'propio' ? 'Recurso Propio' : obra.tipoRecurso === 'financiamiento' ? 'Financiamiento' : 'Préstamo'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar obras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {(currentUser.role === 'admin' || currentUser.role === 'residente') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-amber-500 hover:bg-amber-600">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Obra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>{editingObra ? 'Editar Obra' : 'Nueva Obra'}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 p-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre de la Obra *</Label>
                      <Input
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej. Construcción de Puente"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ubicación *</Label>
                      <Input
                        value={formData.ubicacion}
                        onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                        placeholder="Ej. Morelia, Michoacán"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ámbito *</Label>
                      <Select value={formData.ambito} onValueChange={(v) => setFormData({ ...formData, ambito: v as ObraAmbito })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="publica">Pública</SelectItem>
                          <SelectItem value="privada">Privada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Recurso *</Label>
                      <Select value={formData.tipoRecurso} onValueChange={(v) => setFormData({ ...formData, tipoRecurso: v as TipoRecurso })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="propio">Propio</SelectItem>
                          <SelectItem value="financiamiento">Financiamiento</SelectItem>
                          <SelectItem value="prestamo">Préstamo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha de Inicio *</Label>
                      <Input
                        type="date"
                        value={formData.fechaInicio}
                        onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de Término *</Label>
                      <Input
                        type="date"
                        value={formData.fechaTermino}
                        onChange={(e) => setFormData({ ...formData, fechaTermino: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Presupuesto *</Label>
                      <Input
                        type="number"
                        value={formData.presupuesto}
                        onChange={(e) => setFormData({ ...formData, presupuesto: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    {currentUser.role === 'admin' && (
                      <div className="space-y-2">
                        <Label>Residente Asignado *</Label>
                        <Select value={formData.residenteId} onValueChange={(v) => setFormData({ ...formData, residenteId: v })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {residentes.map(r => (
                              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {editingObra && currentUser.role === 'admin' && (
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select value={formData.estado} onValueChange={(v) => setFormData({ ...formData, estado: v as EstadoObra })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activa">Activa</SelectItem>
                          <SelectItem value="terminada">Terminada</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={!formData.nombre || !formData.ubicacion || !formData.fechaInicio || !formData.fechaTermino}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {editingObra ? 'Guardar Cambios' : 'Crear Obra'}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activas" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="activas">
            Activas ({obrasActivas.length})
          </TabsTrigger>
          <TabsTrigger value="terminadas">
            Terminadas ({obrasTerminadas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activas" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {obrasActivas.map(obra => (
              <ObraCard key={obra.id} obra={obra} />
            ))}
            {obrasActivas.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No hay obras activas</p>
                <p className="text-sm">Crea una nueva obra para comenzar</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="terminadas" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {obrasTerminadas.map(obra => (
              <ObraCard key={obra.id} obra={obra} />
            ))}
            {obrasTerminadas.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No hay obras terminadas</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

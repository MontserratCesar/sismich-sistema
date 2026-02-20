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
  DollarSign, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye,
  CheckCircle2,
  X,
  CheckCircle,
  Printer
} from 'lucide-react';
import type { Nomina, NominaEmpleado, Obra, User as UserType, EstadoNomina } from '@/types';

interface NominasManagerProps {
  nominas: Nomina[];
  obras: Obra[];
  users: UserType[];
  currentUser: UserType;
  onCreate: (nomina: Omit<Nomina, 'id' | 'createdAt' | 'updatedAt' | 'totalNomina'>) => void;
  onUpdate: (id: string, nomina: Partial<Nomina>) => void;
  onDelete: (id: string) => void;
  onValidar: (id: string) => void;
  onAutorizar: (id: string) => void;
  onPagar: (id: string) => void;
  onViewDetail: (nomina: Nomina) => void;
}

const emptyEmpleado: NominaEmpleado = {
  id: '',
  nombre: '',
  puesto: '',
  dias: { lun: 0, mar: 0, mie: 0, jue: 0, vie: 0, sab: 0, dom: 0 },
  totalDias: 0,
  salarioDiario: 0,
  totalSemana: 0,
  observaciones: '',
};

export function NominasManager({ 
  nominas, 
  obras, 
  currentUser, 
  onCreate, 
  onUpdate, 
  onDelete,
  onValidar,
  onAutorizar,
  onPagar,
  onViewDetail
}: NominasManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNomina, setEditingNomina] = useState<Nomina | null>(null);
  const [selectedObraId, setSelectedObraId] = useState('');
  const [semanaDel, setSemanaDel] = useState('');
  const [semanaAl, setSemanaAl] = useState('');
  const [fechaElaboracion, setFechaElaboracion] = useState(new Date().toISOString().split('T')[0]);
  const [empleados, setEmpleados] = useState<NominaEmpleado[]>([{ ...emptyEmpleado, id: '1' }]);

  const misObras = currentUser.role === 'admin' 
    ? obras 
    : obras.filter(o => o.residenteId === currentUser.id);

  const filteredNominas = nominas.filter(nomina => {
    const matchesSearch = 
      nomina.obraName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nomina.residenteName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentUser.role === 'admin') {
      return matchesSearch;
    } else if (currentUser.role === 'residente') {
      return matchesSearch && nomina.residenteId === currentUser.id;
    } else if (currentUser.role === 'contadora') {
      return matchesSearch && (nomina.estado === 'autorizada' || nomina.estado === 'pagada');
    }
    return false;
  });

  const nominasByEstado = {
    pendiente: filteredNominas.filter(n => n.estado === 'pendiente'),
    validada: filteredNominas.filter(n => n.estado === 'validada'),
    autorizada: filteredNominas.filter(n => n.estado === 'autorizada'),
    pagada: filteredNominas.filter(n => n.estado === 'pagada'),
  };

  const handleOpenDialog = (nomina?: Nomina) => {
    if (nomina) {
      setEditingNomina(nomina);
      setSelectedObraId(nomina.obraId);
      setSemanaDel(nomina.semanaDel);
      setSemanaAl(nomina.semanaAl);
      setFechaElaboracion(nomina.fechaElaboracion);
      setEmpleados(nomina.empleados);
    } else {
      setEditingNomina(null);
      setSelectedObraId(misObras[0]?.id || '');
      setSemanaDel('');
      setSemanaAl('');
      setFechaElaboracion(new Date().toISOString().split('T')[0]);
      setEmpleados([{ ...emptyEmpleado, id: '1' }]);
    }
    setIsDialogOpen(true);
  };

  const calcularTotalDias = (dias: NominaEmpleado['dias']) => {
    return Object.values(dias).reduce((sum, d) => sum + (d > 0 ? 1 : 0), 0);
  };

  const handleEmpleadoChange = (index: number, field: keyof NominaEmpleado, value: any) => {
    const updated = [...empleados];
    if (field === 'dias') {
      updated[index].dias = { ...updated[index].dias, ...value };
      updated[index].totalDias = calcularTotalDias(updated[index].dias);
    } else {
      (updated[index] as any)[field] = value;
    }
    updated[index].totalSemana = updated[index].totalDias * updated[index].salarioDiario;
    setEmpleados(updated);
  };

  const addEmpleado = () => {
    setEmpleados([...empleados, { ...emptyEmpleado, id: Date.now().toString() }]);
  };

  const removeEmpleado = (index: number) => {
    if (empleados.length > 1) {
      setEmpleados(empleados.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    const obra = obras.find(o => o.id === selectedObraId);
    const nominaData = {
      obraId: selectedObraId,
      obraName: obra?.nombre || '',
      semanaDel,
      semanaAl,
      fechaElaboracion,
      empleados,
      estado: 'pendiente' as EstadoNomina,
      residenteId: currentUser.id,
      residenteName: currentUser.name,
    };

    if (editingNomina) {
      onUpdate(editingNomina.id, nominaData);
    } else {
      onCreate(nominaData);
    }
    setIsDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const NominaCard = ({ nomina }: { nomina: Nomina }) => {
    return (
      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900">
                  Semana del {new Date(nomina.semanaDel).toLocaleDateString('es-MX')}
                </h3>
                <Badge 
                  variant="outline"
                  className={
                    nomina.estado === 'pagada' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                    nomina.estado === 'autorizada' ? 'text-purple-600 border-purple-200 bg-purple-50' :
                    nomina.estado === 'validada' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                    'text-amber-600 border-amber-200 bg-amber-50'
                  }
                >
                  {nomina.estado}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">{nomina.obraName}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onViewDetail(nomina)}>
                <Eye className="w-4 h-4" />
              </Button>
              {nomina.estado === 'pendiente' && currentUser.id === nomina.residenteId && (
                <>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(nomina)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDelete(nomina.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Obra</p>
              <p className="font-medium text-sm">{nomina.obraName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Residente</p>
              <p className="font-medium text-sm">{nomina.residenteName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Empleados</p>
              <p className="font-medium text-sm">{nomina.empleados.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-bold text-emerald-600">{formatCurrency(nomina.totalNomina)}</p>
            </div>
          </div>

          {/* Acciones según estado */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            {nomina.estado === 'pendiente' && currentUser.id === nomina.residenteId && (
              <Button size="sm" onClick={() => onValidar(nomina.id)} className="bg-blue-500 hover:bg-blue-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Validar
              </Button>
            )}
            {nomina.estado === 'validada' && currentUser.role === 'admin' && (
              <Button size="sm" onClick={() => onAutorizar(nomina.id)} className="bg-purple-500 hover:bg-purple-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Autorizar
              </Button>
            )}
            {nomina.estado === 'autorizada' && currentUser.role === 'contadora' && (
              <Button size="sm" onClick={() => onPagar(nomina.id)} className="bg-emerald-500 hover:bg-emerald-600">
                <DollarSign className="w-4 h-4 mr-2" />
                Registrar Pago
              </Button>
            )}
            {nomina.estado === 'pagada' && (
              <Button size="sm" variant="outline" onClick={() => onViewDetail(nomina)}>
                <Printer className="w-4 h-4 mr-2" />
                Ver Comprobante
              </Button>
            )}
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
            placeholder="Buscar nóminas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {(currentUser.role === 'residente' || currentUser.role === 'admin') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="bg-amber-500 hover:bg-amber-600">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Nómina
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>{editingNomina ? 'Editar Nómina' : 'Nueva Nómina Semanal'}</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[80vh]">
                <div className="space-y-4 p-1">
                  {/* Header Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label>Obra *</Label>
                      <Select value={selectedObraId} onValueChange={setSelectedObraId}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {misObras.map(o => (
                            <SelectItem key={o.id} value={o.id}>{o.nombre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Semana del *</Label>
                      <Input type="date" value={semanaDel} onChange={(e) => setSemanaDel(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>al *</Label>
                      <Input type="date" value={semanaAl} onChange={(e) => setSemanaAl(e.target.value)} />
                    </div>
                  </div>

                  {/* Tabla de Empleados - Formato SISMICH */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-amber-500 text-white">
                          <th className="border border-gray-300 px-2 py-2 text-sm">No.</th>
                          <th className="border border-gray-300 px-2 py-2 text-sm">NOMBRE</th>
                          <th className="border border-gray-300 px-2 py-2 text-sm">PUESTO</th>
                          <th className="border border-gray-300 px-2 py-2 text-sm text-center" colSpan={7}>DÍAS LABORADOS</th>
                          <th className="border border-gray-300 px-2 py-2 text-sm">TOTAL DÍAS</th>
                          <th className="border border-gray-300 px-2 py-2 text-sm">SALARIO DIARIO</th>
                          <th className="border border-gray-300 px-2 py-2 text-sm">TOTAL SEMANA</th>
                          <th className="border border-gray-300 px-2 py-2 text-sm">OBSERVACIONES</th>
                          <th className="border border-gray-300 px-2 py-2 text-sm"></th>
                        </tr>
                        <tr className="bg-amber-100">
                          <th className="border border-gray-300 px-1 py-1"></th>
                          <th className="border border-gray-300 px-1 py-1"></th>
                          <th className="border border-gray-300 px-1 py-1"></th>
                          {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(dia => (
                            <th key={dia} className="border border-gray-300 px-1 py-1 text-xs">{dia}</th>
                          ))}
                          <th className="border border-gray-300 px-1 py-1"></th>
                          <th className="border border-gray-300 px-1 py-1"></th>
                          <th className="border border-gray-300 px-1 py-1"></th>
                          <th className="border border-gray-300 px-1 py-1"></th>
                          <th className="border border-gray-300 px-1 py-1"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {empleados.map((emp, index) => (
                          <tr key={emp.id}>
                            <td className="border border-gray-300 px-1 py-1 text-center">{index + 1}</td>
                            <td className="border border-gray-300 px-1 py-1">
                              <Input
                                value={emp.nombre}
                                onChange={(e) => handleEmpleadoChange(index, 'nombre', e.target.value)}
                                className="h-8 text-sm min-w-[150px]"
                                placeholder="Nombre completo"
                              />
                            </td>
                            <td className="border border-gray-300 px-1 py-1">
                              <Input
                                value={emp.puesto}
                                onChange={(e) => handleEmpleadoChange(index, 'puesto', e.target.value)}
                                className="h-8 text-sm min-w-[100px]"
                                placeholder="Puesto"
                              />
                            </td>
                            {(['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'] as const).map(dia => (
                              <td key={dia} className="border border-gray-300 px-1 py-1">
                                <Input
                                  type="number"
                                  min="0"
                                  max="1"
                                  value={emp.dias[dia] || ''}
                                  onChange={(e) => handleEmpleadoChange(index, 'dias', { [dia]: parseFloat(e.target.value) || 0 })}
                                  className="h-8 text-sm w-12 text-center p-1"
                                />
                              </td>
                            ))}
                            <td className="border border-gray-300 px-1 py-1 text-center font-semibold">
                              {emp.totalDias}
                            </td>
                            <td className="border border-gray-300 px-1 py-1">
                              <Input
                                type="number"
                                value={emp.salarioDiario || ''}
                                onChange={(e) => handleEmpleadoChange(index, 'salarioDiario', parseFloat(e.target.value) || 0)}
                                className="h-8 text-sm w-24"
                                placeholder="$0.00"
                              />
                            </td>
                            <td className="border border-gray-300 px-1 py-1 text-right font-semibold text-emerald-600">
                              {formatCurrency(emp.totalSemana)}
                            </td>
                            <td className="border border-gray-300 px-1 py-1">
                              <Input
                                value={emp.observaciones}
                                onChange={(e) => handleEmpleadoChange(index, 'observaciones', e.target.value)}
                                className="h-8 text-sm min-w-[100px]"
                                placeholder="Notas"
                              />
                            </td>
                            <td className="border border-gray-300 px-1 py-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => removeEmpleado(index)}
                                disabled={empleados.length === 1}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-100 font-bold">
                          <td className="border border-gray-300 px-2 py-2 text-right" colSpan={12}>
                            TOTAL NÓMINA:
                          </td>
                          <td className="border border-gray-300 px-2 py-2 text-right text-emerald-600">
                            {formatCurrency(empleados.reduce((sum, emp) => sum + emp.totalSemana, 0))}
                          </td>
                          <td className="border border-gray-300 px-2 py-2" colSpan={2}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <Button type="button" variant="outline" onClick={addEmpleado} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Empleado
                  </Button>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={!selectedObraId || !semanaDel || !semanaAl || empleados.some(e => !e.nombre)}
                      className="bg-amber-500 hover:bg-amber-600"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {editingNomina ? 'Guardar Cambios' : 'Crear Nómina'}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pendiente" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="pendiente">
            Pendientes ({nominasByEstado.pendiente.length})
          </TabsTrigger>
          <TabsTrigger value="validada">
            Validadas ({nominasByEstado.validada.length})
          </TabsTrigger>
          <TabsTrigger value="autorizada">
            Autorizadas ({nominasByEstado.autorizada.length})
          </TabsTrigger>
          <TabsTrigger value="pagada">
            Pagadas ({nominasByEstado.pagada.length})
          </TabsTrigger>
        </TabsList>

        {(['pendiente', 'validada', 'autorizada', 'pagada'] as const).map(estado => (
          <TabsContent key={estado} value={estado} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {nominasByEstado[estado].map(nomina => (
                <NominaCard key={nomina.id} nomina={nomina} />
              ))}
              {nominasByEstado[estado].length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No hay nóminas {estado}s</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

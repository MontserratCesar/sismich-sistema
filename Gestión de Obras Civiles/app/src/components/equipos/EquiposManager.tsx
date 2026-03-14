import { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Clock, 
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Save,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { RentaEquipo, Obra } from '@/types';

interface EquiposManagerProps {
  obra: Obra;
  onGuardarEquipo?: (equipo: RentaEquipo) => void;
}

export function EquiposManager({ obra, onGuardarEquipo }: EquiposManagerProps) {
  const [equipos, setEquipos] = useState<RentaEquipo[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Estado del formulario
  const [nuevoEquipo, setNuevoEquipo] = useState<Partial<RentaEquipo>>({
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '08:00',
    horaTermino: '17:00',
    precioPorDia: 0,
    statusPago: 'pendiente'
  });

  // Lista de equipos comunes (puedes expandirla)
  const equiposComunes = [
    'Andamios (por m²)',
    'Bailarina (compactadora)',
    'Mezcladora (por día)',
    'Vibrador de concreto',
    'Soldadora eléctrica',
    'Generador eléctrico',
    'Bomba de agua',
    'Escalera extensión',
    'Cortadora de disco',
    'Rotomartillo'
  ];

  const calcularTotales = () => {
    const inicio = new Date(`2000-01-01T${nuevoEquipo.horaInicio}`);
    const fin = new Date(`2000-01-01T${nuevoEquipo.horaTermino}`);
    
    let horasDiff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
    if (horasDiff < 0) horasDiff += 24; // Si cruza la medianoche
    
    const dias = Math.ceil(horasDiff / 8); // Jornada de 8 horas = 1 día
    const totalHoras = Math.max(0, horasDiff);
    const importe = dias * (nuevoEquipo.precioPorDia || 0);
    
    return { totalHoras: Math.round(totalHoras * 10) / 10, dias, importe };
  };

  const handleGuardar = () => {
    if (!nuevoEquipo.equipo || !nuevoEquipo.concepto) {
      toast.error('Completa el equipo y el concepto');
      return;
    }

    const { totalHoras, dias, importe } = calcularTotales();
    
    const equipoCompleto: RentaEquipo = {
      id: Date.now().toString(),
      obraId: obra.id,
      concepto: nuevoEquipo.concepto || '',
      equipo: nuevoEquipo.equipo || '',
      fecha: nuevoEquipo.fecha || new Date().toISOString(),
      horaInicio: nuevoEquipo.horaInicio || '08:00',
      horaTermino: nuevoEquipo.horaTermino || '17:00',
      totalHoras,
      totalDias: dias,
      precioPorDia: nuevoEquipo.precioPorDia || 0,
      importe,
      descripcionTrabajo: nuevoEquipo.descripcionTrabajo || '',
      proveedor: nuevoEquipo.proveedor || '',
      statusPago: 'pendiente',
      semanaReporte: obra.semanaActualReporte || 1
    };

    setEquipos([...equipos, equipoCompleto]);
    onGuardarEquipo?.(equipoCompleto);
    
    // Reset form
    setNuevoEquipo({
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '08:00',
      horaTermino: '17:00',
      precioPorDia: 0,
      statusPago: 'pendiente'
    });
    
    setMostrarFormulario(false);
    toast.success('Renta de equipo registrada. Afectará el avance físico.');
  };

  const eliminarEquipo = (id: string) => {
    setEquipos(equipos.filter(e => e.id !== id));
    toast.success('Registro eliminado');
  };

  const totalAcumulado = equipos.reduce((sum, e) => sum + e.importe, 0);
  const equiposPagados = equipos.filter(e => e.statusPago === 'pagado').length;

  return (
    <div className="space-y-6">
      {/* Header con stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total en Rentas</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${totalAcumulado.toLocaleString('es-MX')}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Equipos Rentados</p>
                <p className="text-2xl font-bold text-blue-900">
                  {equipos.length}
                </p>
              </div>
              <Truck className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Pagados</p>
                <p className="text-2xl font-bold text-green-900">
                  {equiposPagados} / {equipos.length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botón nuevo */}
      {!mostrarFormulario && (
        <div className="flex justify-end">
          <Button 
            onClick={() => setMostrarFormulario(true)} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Nueva Renta
          </Button>
        </div>
      )}

      {/* Formulario */}
      {mostrarFormulario && (
        <Card className="border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Registrar Renta de Equipo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selector de equipo */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {equiposComunes.map((eq) => (
                <button
                  key={eq}
                  onClick={() => setNuevoEquipo({...nuevoEquipo, equipo: eq})}
                  className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                    nuevoEquipo.equipo === eq 
                      ? 'bg-purple-100 border-purple-500 text-purple-900' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {eq}
                </button>
              ))}
              <button
                onClick={() => setNuevoEquipo({...nuevoEquipo, equipo: 'OTRO'})}
                className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                  nuevoEquipo.equipo === 'OTRO' 
                    ? 'bg-purple-100 border-purple-500 text-purple-900' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                Otro (especificar)
              </button>
            </div>

            {nuevoEquipo.equipo === 'OTRO' && (
              <div>
                <Label>Especifica el equipo</Label>
                <Input 
                  placeholder="Ej: Compresor industrial"
                  onChange={(e) => setNuevoEquipo({...nuevoEquipo, equipo: e.target.value})}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Concepto / Partida</Label>
                <Input 
                  placeholder="Ej: Renta de andamios para muro perimetral"
                  value={nuevoEquipo.concepto || ''}
                  onChange={(e) => setNuevoEquipo({...nuevoEquipo, concepto: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Proveedor</Label>
                <Input 
                  placeholder="Nombre del proveedor"
                  value={nuevoEquipo.proveedor || ''}
                  onChange={(e) => setNuevoEquipo({...nuevoEquipo, proveedor: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Fecha</Label>
                <Input 
                  type="date"
                  value={nuevoEquipo.fecha?.split('T')[0]}
                  onChange={(e) => setNuevoEquipo({...nuevoEquipo, fecha: e.target.value})}
                />
              </div>
              
              <div>
                <Label>Hora Inicio</Label>
                <Input 
                  type="time"
                  value={nuevoEquipo.horaInicio}
                  onChange={(e) => setNuevoEquipo({...nuevoEquipo, horaInicio: e.target.value})}
                />
              </div>

              <div>
                <Label>Hora Término</Label>
                <Input 
                  type="time"
                  value={nuevoEquipo.horaTermino}
                  onChange={(e) => setNuevoEquipo({...nuevoEquipo, horaTermino: e.target.value})}
                />
              </div>

              <div>
                <Label>Precio por Día ($)</Label>
                <Input 
                  type="number"
                  placeholder="0.00"
                  value={nuevoEquipo.precioPorDia || ''}
                  onChange={(e) => setNuevoEquipo({...nuevoEquipo, precioPorDia: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            {/* Preview de cálculo */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-purple-900 mb-2">Resumen del cálculo:</p>
              <div className="flex gap-4 text-sm">
                <span>Total Horas: <strong>{calcularTotales().totalHoras} hrs</strong></span>
                <span>Total Días: <strong>{calcularTotales().dias} días</strong></span>
                <span className="text-purple-700 font-bold">
                  Importe: ${calcularTotales().importe.toLocaleString('es-MX')}
                </span>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                Descripción de trabajos realizados (afecta avance físico)
              </Label>
              <textarea 
                className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Ej: Compactación de 150m² de base para cimentación. Uso de bailarina en zona norte del predio."
                value={nuevoEquipo.descripcionTrabajo || ''}
                onChange={(e) => setNuevoEquipo({...nuevoEquipo, descripcionTrabajo: e.target.value})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta descripción se vinculará automáticamente al reporte de avance físico de la semana.
              </p>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setMostrarFormulario(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleGuardar}
                disabled={!nuevoEquipo.equipo || !nuevoEquipo.concepto}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Renta
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de equipos registrados */}
      {equipos.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Historial de Rentas
          </h3>
          
          {equipos.map((equipo) => (
            <Card key={equipo.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">{equipo.equipo}</h4>
                      <Badge className={
                        equipo.statusPago === 'pagado' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {equipo.statusPago === 'pagado' ? 'PAGADO' : 'PENDIENTE'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{equipo.concepto}</p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(equipo.fecha).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {equipo.horaInicio} - {equipo.horaTermino} ({equipo.totalHoras} hrs)
                      </span>
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {equipo.totalDias} día(s)
                      </span>
                      {equipo.proveedor && (
                        <span>Proveedor: {equipo.proveedor}</span>
                      )}
                    </div>

                    {equipo.descripcionTrabajo && (
                      <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                        <strong>Trabajo realizado:</strong> {equipo.descripcionTrabajo}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-gray-900">
                      ${equipo.importe.toLocaleString('es-MX')}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${equipo.precioPorDia}/día
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => eliminarEquipo(equipo.id)}
                      className="text-red-600 hover:text-red-700 mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {equipos.length === 0 && !mostrarFormulario && (
        <Card className="p-8 text-center border-dashed border-2">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No hay rentas de equipo registradas</p>
          <p className="text-sm text-gray-500 mt-1">
            Registra la renta de andamios, bailarinas u otro equipo menor
          </p>
        </Card>
      )}
    </div>
  );
}
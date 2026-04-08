import { useState } from 'react';
import { 
  Package, 
  Calculator, 
  ClipboardList, 
  Plus, 
  Trash2, 
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { RequisicionMaterial, MaterialRequerido, Obra, ConceptoPresupuesto } from '@/types';

interface MaterialesManagerProps {
  obra: Obra;
  onGuardarRequisicion?: (req: RequisicionMaterial) => void;
}

type TipoCalculo = 'laminas' | 'concreto' | 'varillas' | 'personalizado';

interface ItemCalculado {
  id: string;
  descripcion: string;
  unidad: string;
  cantidadNeta: number;
  cantidadConDesperdicio: number;
  desperdicio: number;
  precioUnitario?: number;
}

export function MaterialesManager({ obra, onGuardarRequisicion }: MaterialesManagerProps) {
  const [activeTab, setActiveTab] = useState('calculadora');
  
  // Estado de la Calculadora
  const [tipoCalculo, setTipoCalculo] = useState<TipoCalculo>('laminas');
  const [dimensiones, setDimensiones] = useState({
    largo: 0,
    ancho: 0,
    alto: 0,
    piezas: 1
  });
  const [itemsCalculados, setItemsCalculados] = useState<ItemCalculado[]>([]);
  
  // Estado de Requisiciones
  const [requisiciones, setRequisiciones] = useState<RequisicionMaterial[]>([]);
  const [mostrarFormRequisicion, setMostrarFormRequisicion] = useState(false);
  const [nuevaRequisicion, setNuevaRequisicion] = useState<Partial<RequisicionMaterial>>({
    materiales: []
  });

  // Factores de desperdicio
  const factoresDesperdicio = {
    laminas: 0.10,    // 10% para láminas y soleras
    concreto: 0.04,   // 4% para concreto
    varillas: 0.03,   // 3% para varillas
    personalizado: 0.05 // 5% default
  };

  const calcularMateriales = () => {
    const factor = factoresDesperdicio[tipoCalculo];
    let nuevoItem: ItemCalculado;
    
    switch(tipoCalculo) {
      case 'laminas':
        const area = dimensiones.largo * dimensiones.ancho * dimensiones.piezas;
        nuevoItem = {
          id: Date.now().toString(),
          descripcion: `Lámina/solera (${dimensiones.largo}m x ${dimensiones.ancho}m) x ${dimensiones.piezas} pzas`,
          unidad: 'm²',
          cantidadNeta: parseFloat(area.toFixed(2)),
          cantidadConDesperdicio: parseFloat((area * (1 + factor)).toFixed(2)),
          desperdicio: factor
        };
        break;
        
      case 'concreto':
        const volumen = dimensiones.largo * dimensiones.ancho * (dimensiones.alto || 0.2) * dimensiones.piezas;
        nuevoItem = {
          id: Date.now().toString(),
          descripcion: `Concreto resistencia 200kg/cm² (${dimensiones.largo}x${dimensiones.ancho}x${dimensiones.alto}m)`,
          unidad: 'm³',
          cantidadNeta: parseFloat(volumen.toFixed(3)),
          cantidadConDesperdicio: parseFloat((volumen * (1 + factor)).toFixed(3)),
          desperdicio: factor
        };
        break;
        
      case 'varillas':
        const longitudTotal = dimensiones.largo * dimensiones.piezas;
        nuevoItem = {
          id: Date.now().toString(),
          descripcion: `Varilla #${dimensiones.ancho} (equivalente)`,
          unidad: 'ml',
          cantidadNeta: parseFloat(longitudTotal.toFixed(2)),
          cantidadConDesperdicio: parseFloat((longitudTotal * (1 + factor)).toFixed(2)),
          desperdicio: factor
        };
        break;
        
      default:
        const cantidad = dimensiones.largo * dimensiones.ancho * dimensiones.piezas;
        nuevoItem = {
          id: Date.now().toString(),
          descripcion: 'Material calculado personalizado',
          unidad: 'unidad',
          cantidadNeta: parseFloat(cantidad.toFixed(2)),
          cantidadConDesperdicio: parseFloat((cantidad * (1 + factor)).toFixed(2)),
          desperdicio: factor
        };
    }
    
    setItemsCalculados([...itemsCalculados, nuevoItem]);
    toast.success('Material calculado y agregado a la lista');
  };

  const eliminarItemCalculado = (id: string) => {
    setItemsCalculados(itemsCalculados.filter(item => item.id !== id));
  };

  const agregarARequisicion = (item: ItemCalculado) => {
    const nuevoMaterial: MaterialRequerido = {
      id: Date.now().toString(),
      partida: 'MATERIALES',
      concepto: obra.nombre,
      descripcion: item.descripcion,
      unidad: item.unidad,
      cantidadRequerida: item.cantidadConDesperdicio,
      observaciones: `Cantidad neta: ${item.cantidadNeta} | Desperdicio: ${(item.desperdicio * 100).toFixed(0)}%`
    };
    
    setNuevaRequisicion(prev => ({
      ...prev,
      materiales: [...(prev.materiales || []), nuevoMaterial]
    }));
    
    setMostrarFormRequisicion(true);
    setActiveTab('requisiciones');
    toast.success('Material agregado a la requisición actual');
  };

  const guardarRequisicion = () => {
    if (!nuevaRequisicion.materiales?.length) {
      toast.error('Agrega al menos un material');
      return;
    }
    
    const requisicionCompleta: RequisicionMaterial = {
      id: Date.now().toString(),
      obraId: obra.id,
      fechaSolicitud: new Date().toISOString(),
      fechaEntregaSolicitada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 días
      periodo: `Semana ${obra.semanaActualReporte || 1}`,
      materiales: nuevaRequisicion.materiales as MaterialRequerido[],
      status: 'pendiente',
      solicitanteId: obra.residenteId || '',
      solicitanteName: obra.residenteName,
      totalMateriales: nuevaRequisicion.materiales.length
    };
    
    setRequisiciones([...requisiciones, requisicionCompleta]);
    onGuardarRequisicion?.(requisicionCompleta);
    
    // Resetear formulario
    setNuevaRequisicion({ materiales: [] });
    setMostrarFormRequisicion(false);
    toast.success('Requisición enviada a aprobación');
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculadora" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Calculadora Técnica
          </TabsTrigger>
          <TabsTrigger value="requisiciones" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Requisiciones ({requisiciones.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB: CALCULADORA */}
        <TabsContent value="calculadora" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5 text-orange-600" />
                Calculadora de Materiales con Desperdicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selector de Tipo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(['laminas', 'concreto', 'varillas', 'personalizado'] as const).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setTipoCalculo(tipo)}
                    className={`p-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                      tipoCalculo === tipo 
                        ? 'bg-orange-100 border-orange-500 text-orange-900' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {tipo === 'laminas' && 'Láminas y Soleras (10%)'}
                    {tipo === 'concreto' && 'Concreto (4%)'}
                    {tipo === 'varillas' && 'Varillas (3%)'}
                    {tipo === 'personalizado' && 'Personalizado (5%)'}
                  </button>
                ))}
              </div>

              {/* Inputs de Dimensiones */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label>Largo (m)</Label>
                  <Input 
                    type="number" 
                    value={dimensiones.largo} 
                    onChange={(e) => setDimensiones({...dimensiones, largo: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Ancho (m)</Label>
                  <Input 
                    type="number" 
                    value={dimensiones.ancho} 
                    onChange={(e) => setDimensiones({...dimensiones, ancho: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                </div>
                {tipoCalculo === 'concreto' && (
                  <div>
                    <Label>Espesor/Alto (m)</Label>
                    <Input 
                      type="number" 
                      value={dimensiones.alto} 
                      onChange={(e) => setDimensiones({...dimensiones, alto: parseFloat(e.target.value) || 0})}
                      placeholder="0.20"
                    />
                  </div>
                )}
                <div>
                  <Label>Cantidad de Piezas</Label>
                  <Input 
                    type="number" 
                    value={dimensiones.piezas} 
                    onChange={(e) => setDimensiones({...dimensiones, piezas: parseInt(e.target.value) || 1})}
                    min="1"
                  />
                </div>
              </div>

              <Button 
                onClick={calcularMateriales}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Calcular y Agregar a Lista
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Items Calculados */}
          {itemsCalculados.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Materiales Calculados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {itemsCalculados.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.descripcion}</p>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <span>Cantidad Neta: <strong>{item.cantidadNeta} {item.unidad}</strong></span>
                          <span className="text-orange-600">
                            Con desperdicio: <strong>{item.cantidadConDesperdicio} {item.unidad}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => agregarARequisicion(item)}
                        >
                          Agregar a Req.
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => eliminarItemCalculado(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB: REQUISICIONES */}
        <TabsContent value="requisiciones" className="space-y-4">
          {!mostrarFormRequisicion ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">Historial de Requisiciones</h3>
                <Button onClick={() => setMostrarFormRequisicion(true)} className="bg-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Requisición Manual
                </Button>
              </div>

              {requisiciones.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-2">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No hay requisiciones registradas</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Usa la calculadora o crea una requisición manual
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {requisiciones.map((req) => (
                    <Card key={req.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900">Requisición #{req.id.slice(-4)}</h4>
                              <Badge className={
                                req.status === 'aprobada' ? 'bg-green-100 text-green-800' :
                                req.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {req.status?.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {req.materiales?.length} materiales • Entrega: {new Date(req.fechaEntregaSolicitada).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Ver Detalle
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Nueva Requisición de Materiales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {nuevaRequisicion.materiales?.length === 0 ? (
                  <div className="text-center p-4 text-gray-500 bg-gray-50 rounded-lg">
                    <p>No has agregado materiales aún.</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setActiveTab('calculadora')}
                    >
                      Ir a Calculadora
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {nuevaRequisicion.materiales.map((mat, idx) => (
                      <div key={mat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{mat.descripcion}</p>
                          <p className="text-sm text-gray-600">
                            {mat.cantidadRequerida} {mat.unidad}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newMats = nuevaRequisicion.materiales?.filter((_, i) => i !== idx);
                            setNuevaRequisicion({...nuevaRequisicion, materiales: newMats});
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setMostrarFormRequisicion(false);
                      setNuevaRequisicion({ materiales: [] });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="flex-1 bg-orange-600"
                    onClick={guardarRequisicion}
                    disabled={!nuevaRequisicion.materiales?.length}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Enviar Requisición
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
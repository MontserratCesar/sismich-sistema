import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Calculator, Package, Users, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import type { ConceptoPresupuesto, PresupuestoObra } from '@/types';

interface PresupuestoFormProps {
  obraId: string;
  obraName: string;
  presupuestoExistente?: PresupuestoObra;
  onSave: (presupuesto: PresupuestoObra) => void;
  onCancel: () => void;
}

type TipoConcepto = 'material' | 'mano_obra' | 'equipo';

interface FilaPresupuesto extends ConceptoPresupuesto {
  tipo: TipoConcepto;
}

export function PresupuestoForm({ obraId, obraName, presupuestoExistente, onSave, onCancel }: PresupuestoFormProps) {
  // Estados para las 3 secciones
  const [materiales, setMateriales] = useState<FilaPresupuesto[]>([]);
  const [manoObra, setManoObra] = useState<FilaPresupuesto[]>([]);
  const [equipo, setEquipo] = useState<FilaPresupuesto[]>([]);
  
  // Configuración de indirectos y utilidad
  const [indirectosPorcentaje, setIndirectosPorcentaje] = useState(10);
  const [utilidadPorcentaje, setUtilidadPorcentaje] = useState(8);
  
  // Control de secciones colapsadas
  const [seccionMaterialesOpen, setSeccionMaterialesOpen] = useState(true);
  const [seccionManoObraOpen, setSeccionManoObraOpen] = useState(true);
  const [seccionEquipoOpen, setSeccionEquipoOpen] = useState(true);

  // Cargar datos existentes si los hay
  useEffect(() => {
    if (presupuestoExistente) {
      setMateriales(presupuestoExistente.conceptos.filter(c => c.tipo === 'material').map((c, i) => ({...c, num: i + 1})));
      setManoObra(presupuestoExistente.conceptos.filter(c => c.tipo === 'mano_obra').map((c, i) => ({...c, num: i + 10})));
      setEquipo(presupuestoExistente.conceptos.filter(c => c.tipo === 'equipo').map((c, i) => ({...c, num: i + 20})));
      setIndirectosPorcentaje(presupuestoExistente.indirectosPorcentaje || 10);
      setUtilidadPorcentaje(presupuestoExistente.utilidadPorcentaje || 8);
    } else {
      // Valores por defecto - una fila vacía en cada sección
      setMateriales([{ id: 'mat-1', num: 1, concepto: '', cantidad: 0, unidad: '', costoUnitario: 0, importe: 0, tipo: 'material' }]);
      setManoObra([{ id: 'mo-1', num: 10, concepto: '', cantidad: 0, unidad: '', costoUnitario: 0, importe: 0, tipo: 'mano_obra' }]);
      setEquipo([{ id: 'eq-1', num: 20, concepto: '', cantidad: 0, unidad: '', costoUnitario: 0, importe: 0, tipo: 'equipo' }]);
    }
  }, [presupuestoExistente]);

  // Funciones para agregar/eliminar filas
  const addFila = (tipo: TipoConcepto) => {
    const newFila: FilaPresupuesto = {
      id: `${tipo}-${Date.now()}`,
      num: tipo === 'material' ? materiales.length + 1 : tipo === 'mano_obra' ? manoObra.length + 10 : equipo.length + 20,
      concepto: '',
      cantidad: 0,
      unidad: '',
      costoUnitario: 0,
      importe: 0,
      tipo
    };

    if (tipo === 'material') setMateriales([...materiales, newFila]);
    else if (tipo === 'mano_obra') setManoObra([...manoObra, newFila]);
    else setEquipo([...equipo, newFila]);
  };

  const removeFila = (tipo: TipoConcepto, index: number) => {
    if (tipo === 'material') {
      const updated = materiales.filter((_, i) => i !== index);
      // Renumerar
      updated.forEach((f, i) => f.num = i + 1);
      setMateriales(updated);
    } else if (tipo === 'mano_obra') {
      const updated = manoObra.filter((_, i) => i !== index);
      updated.forEach((f, i) => f.num = i + 10);
      setManoObra(updated);
    } else {
      const updated = equipo.filter((_, i) => i !== index);
      updated.forEach((f, i) => f.num = i + 20);
      setEquipo(updated);
    }
  };

  const updateFila = (tipo: TipoConcepto, index: number, field: keyof FilaPresupuesto, value: string | number) => {
    let updated: FilaPresupuesto[];
    
    if (tipo === 'material') {
      updated = [...materiales];
      (updated[index] as any)[field] = value;
      if (field === 'cantidad' || field === 'costoUnitario') {
        updated[index].importe = updated[index].cantidad * updated[index].costoUnitario;
      }
      setMateriales(updated);
    } else if (tipo === 'mano_obra') {
      updated = [...manoObra];
      (updated[index] as any)[field] = value;
      if (field === 'cantidad' || field === 'costoUnitario') {
        updated[index].importe = updated[index].cantidad * updated[index].costoUnitario;
      }
      setManoObra(updated);
    } else {
      updated = [...equipo];
      (updated[index] as any)[field] = value;
      if (field === 'cantidad' || field === 'costoUnitario') {
        updated[index].importe = updated[index].cantidad * updated[index].costoUnitario;
      }
      setEquipo(updated);
    }
  };

  // Cálculos automáticos
  const sumaMateriales = materiales.reduce((sum, f) => sum + (f.importe || 0), 0);
  const sumaManoObra = manoObra.reduce((sum, f) => sum + (f.importe || 0), 0);
  const sumaEquipo = equipo.reduce((sum, f) => sum + (f.importe || 0), 0);
  const costoDirecto = sumaMateriales + sumaManoObra + sumaEquipo;
  const indirectosMonto = costoDirecto * (indirectosPorcentaje / 100);
  const utilidadMonto = costoDirecto * (utilidadPorcentaje / 100);
  const totalPresupuesto = costoDirecto + indirectosMonto + utilidadMonto;

  const handleSave = () => {
    const presupuesto: PresupuestoObra = {
      conceptos: [...materiales, ...manoObra, ...equipo].filter(f => f.concepto.trim() !== ''),
      sumaMateriales,
      sumaManoObra,
      sumaEquipo,
      costoDirecto,
      indirectos: indirectosMonto,
      indirectosPorcentaje,
      utilidadMonto,
      utilidadPorcentaje,
      totalPresupuesto
    };
    onSave(presupuesto);
  };

  const renderTabla = (titulo: string, filas: FilaPresupuesto[], tipo: TipoConcepto, color: string, icono: any, isOpen: boolean, setIsOpen: (v: boolean) => void, startNum: number) => {
    const subtotal = filas.reduce((sum, f) => sum + (f.importe || 0), 0);
    
    return (
      <div className={`border-2 rounded-lg overflow-hidden mb-6 ${color}`}>
        <div 
          className={`px-4 py-3 border-b flex justify-between items-center cursor-pointer hover:opacity-90`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className={`font-bold flex items-center gap-2 ${color.replace('border-', 'text-').replace('100', '900')}`}>
            {icono}
            {titulo}
          </h3>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white/50`}>
              Subtotal: ${subtotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}
            </span>
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </div>
        </div>
        
        {isOpen && (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700 font-semibold">
                <tr>
                  <th className="border border-gray-200 px-3 py-2 text-center w-16">Núm.</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Concepto</th>
                  <th className="border border-gray-200 px-3 py-2 text-center w-24">Cantidad</th>
                  <th className="border border-gray-200 px-3 py-2 text-center w-24">Unidad</th>
                  <th className="border border-gray-200 px-3 py-2 text-right w-32">Costo Unit.</th>
                  <th className="border border-gray-200 px-3 py-2 text-right w-32">Importe</th>
                  <th className="border border-gray-200 px-3 py-2 text-center w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, index) => (
                  <tr key={fila.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-3 py-2 text-center text-gray-500">
                      {startNum + index}
                    </td>
                    <td className="border border-gray-200 px-2 py-1">
                      <Input
                        value={fila.concepto}
                        onChange={(e) => updateFila(tipo, index, 'concepto', e.target.value)}
                        className="w-full border-0 focus:ring-0 p-1 h-8"
                        placeholder="Descripción del concepto..."
                      />
                    </td>
                    <td className="border border-gray-200 px-2 py-1">
                      <Input
                        type="number"
                        value={fila.cantidad || ''}
                        onChange={(e) => updateFila(tipo, index, 'cantidad', parseFloat(e.target.value) || 0)}
                        className="w-full text-center border-0 focus:ring-0 p-1 h-8"
                        placeholder="0"
                      />
                    </td>
                    <td className="border border-gray-200 px-2 py-1">
                      <Input
                        value={fila.unidad}
                        onChange={(e) => updateFila(tipo, index, 'unidad', e.target.value)}
                        className="w-full text-center border-0 focus:ring-0 p-1 h-8"
                        placeholder="m2, m3, kg..."
                      />
                    </td>
                    <td className="border border-gray-200 px-2 py-1">
                      <Input
                        type="number"
                        value={fila.costoUnitario || ''}
                        onChange={(e) => updateFila(tipo, index, 'costoUnitario', parseFloat(e.target.value) || 0)}
                        className="w-full text-right border-0 focus:ring-0 p-1 h-8"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2 text-right font-medium text-gray-900">
                      ${fila.importe.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                    </td>
                    <td className="border border-gray-200 px-2 py-1 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFila(tipo, index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        disabled={filas.length === 1 && !fila.concepto}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-3 bg-gray-50 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addFila(tipo)}
                className="w-full border-dashed"
              >
                <Plus className="w-4 h-4 mr-2" /> Agregar Concepto
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Presupuesto de Obra</h1>
            <p className="text-blue-100 mt-1">{obraName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200">Total Presupuesto</p>
            <p className="text-3xl font-bold">${totalPresupuesto.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
          </div>
        </div>
      </div>

      {/* Secciones */}
      {renderTabla('MATERIALES', materiales, 'material', 'border-blue-200', <Package className="w-5 h-5 text-blue-600" />, seccionMaterialesOpen, setSeccionMaterialesOpen, 1)}
      
      {renderTabla('MANO DE OBRA', manoObra, 'mano_obra', 'border-orange-200', <Users className="w-5 h-5 text-orange-600" />, seccionManoObraOpen, setSeccionManoObraOpen, 10)}
      
      {renderTabla('EQUIPO Y HERRAMIENTA', equipo, 'equipo', 'border-purple-200', <Wrench className="w-5 h-5 text-purple-600" />, seccionEquipoOpen, setSeccionEquipoOpen, 20)}

      {/* Configuración de Indirectos y Utilidad */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Configuración de Costos Indirectos y Utilidad
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Indirectos (%)</label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={indirectosPorcentaje}
                onChange={(e) => setIndirectosPorcentaje(parseFloat(e.target.value) || 0)}
                className="w-24"
                min="0"
                max="100"
              />
              <span className="text-gray-500">= ${indirectosMonto.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Gastos de oficina, supervisión, etc.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Utilidad (%)</label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={utilidadPorcentaje}
                onChange={(e) => setUtilidadPorcentaje(parseFloat(e.target.value) || 0)}
                className="w-24"
                min="0"
                max="100"
              />
              <span className="text-gray-500">= ${utilidadMonto.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Margen de ganancia del contratista</p>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Final */}
      <div className="bg-gray-900 text-white rounded-lg p-6 sticky bottom-6 shadow-2xl">
        <h3 className="text-lg font-bold mb-4">Resumen del Presupuesto</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-gray-700">
              <span className="text-gray-400">Suma de Materiales:</span>
              <span className="font-mono">${sumaMateriales.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-700">
              <span className="text-gray-400">Suma de Mano de Obra:</span>
              <span className="font-mono">${sumaManoObra.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-700">
              <span className="text-gray-400">Suma de Equipo:</span>
              <span className="font-mono">${sumaEquipo.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between py-2 border-b-2 border-green-500 font-semibold">
              <span className="text-green-400">COSTO DIRECTO:</span>
              <span className="font-mono text-green-400">${costoDirecto.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Indirectos ({indirectosPorcentaje}%):</span>
              <span className="font-mono">${indirectosMonto.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Utilidad ({utilidadPorcentaje}%):</span>
              <span className="font-mono">${utilidadMonto.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between py-3 mt-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-4 text-lg font-bold">
              <span>TOTAL:</span>
              <span className="font-mono">${totalPresupuesto.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4 sticky bottom-0 bg-white p-4 border-t shadow-lg -mx-6 -mb-6">
        <Button variant="outline" onClick={onCancel} size="lg">
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="w-5 h-5 mr-2" />
          Guardar Presupuesto
        </Button>
      </div>
    </div>
  );
}
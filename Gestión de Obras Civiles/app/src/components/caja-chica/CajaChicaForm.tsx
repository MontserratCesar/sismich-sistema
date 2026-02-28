import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, Calculator } from 'lucide-react';

interface CajaChicaFormProps {
  obraId: string;
  obraName: string;
  residenteName: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function CajaChicaForm({ obraId, obraName, residenteName, onSave, onCancel }: CajaChicaFormProps) {
  const [semanaDel, setSemanaDel] = useState('');
  const [semanaAl, setSemanaAl] = useState('');
  const [saldoAnterior, setSaldoAnterior] = useState(0);
  const [importeEntregado, setImporteEntregado] = useState(0);
  
  const [gastos, setGastos] = useState([
    { id: '1', descripcion: '', unidad: 'NOTA', cantidad: 1, precioUnitario: 0, importe: 0, observaciones: '' }
  ]);

  const addGasto = () => {
    const newId = (gastos.length + 1).toString();
    setGastos([...gastos, {
      id: newId,
      descripcion: '',
      unidad: 'NOTA',
      cantidad: 1,
      precioUnitario: 0,
      importe: 0,
      observaciones: ''
    }]);
  };

  const removeGasto = (index: number) => {
    if (gastos.length === 1) return;
    const updated = [...gastos];
    updated.splice(index, 1);
    updated.forEach((g, idx) => g.id = (idx + 1).toString());
    setGastos(updated);
  };

  const updateGasto = (index: number, field: string, value: any) => {
    const updated = [...gastos];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'cantidad' || field === 'precioUnitario') {
      const cant = field === 'cantidad' ? parseFloat(value) || 0 : updated[index].cantidad;
      const precio = field === 'precioUnitario' ? parseFloat(value) || 0 : updated[index].precioUnitario;
      updated[index].importe = cant * precio;
    }
    
    setGastos(updated);
  };

  const totalComprobado = gastos.reduce((sum, g) => sum + g.importe, 0);
  const saldoEnCaja = saldoAnterior + importeEntregado - totalComprobado;

  const handleSubmit = () => {
    onSave({
      obraId,
      semanaDel,
      semanaAl,
      saldoAnterior,
      importeEntregado,
      gastos,
      elaboradoPor: residenteName
    });
  };

  return (
    <div className="space-y-6">
      {/* Header igual al Excel */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold">GASTOS INDIRECTOS (AUTOS, RENTAS, PAGOS VARIOS)</h1>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <p><span className="text-green-200">OBRA:</span> {obraName}</p>
            <p><span className="text-green-200">MUNICIPIO:</span> MORELIA</p>
          </div>
          <div className="text-right">
            <p><span className="text-green-200">RESIDENTE:</span> {residenteName}</p>
            <p><span className="text-green-200">FECHA:</span> {new Date().toLocaleDateString('es-MX')}</p>
          </div>
        </div>
      </div>

      {/* Control de Semana y Saldos */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <Label>Semana del:</Label>
              <Input type="date" value={semanaDel} onChange={(e) => setSemanaDel(e.target.value)} />
            </div>
            <div>
              <Label>Semana al:</Label>
              <Input type="date" value={semanaAl} onChange={(e) => setSemanaAl(e.target.value)} />
            </div>
            <div>
              <Label>Saldo Anterior ($):</Label>
              <Input 
                type="number" 
                value={saldoAnterior} 
                onChange={(e) => setSaldoAnterior(parseFloat(e.target.value) || 0)} 
              />
            </div>
            <div>
              <Label>Importe Entregado ($):</Label>
              <Input 
                type="number" 
                value={importeEntregado} 
                onChange={(e) => setImporteEntregado(parseFloat(e.target.value) || 0)} 
              />
            </div>
          </div>

          {/* Tabla de Gastos (igual al Excel) */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-100">
                  <th className="border p-2 w-16">NÚM.</th>
                  <th className="border p-2">DESCRIPCIÓN DEL GASTO</th>
                  <th className="border p-2 w-32">UNIDAD</th>
                  <th className="border p-2 w-24">CANT.</th>
                  <th className="border p-2 w-32">PRECIO UNIT.</th>
                  <th className="border p-2 w-32">IMPORTE</th>
                  <th className="border p-2">OBSERVACIONES</th>
                  <th className="border p-2 w-20">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((gasto, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2 text-center font-medium">{index + 1}</td>
                    <td className="border p-2">
                      <Input 
                        value={gasto.descripcion} 
                        onChange={(e) => updateGasto(index, 'descripcion', e.target.value)}
                        placeholder="Ej: MATERIAL HIDRAULICO"
                      />
                    </td>
                    <td className="border p-2">
                      <select 
                        className="w-full p-2 border rounded"
                        value={gasto.unidad}
                        onChange={(e) => updateGasto(index, 'unidad', e.target.value)}
                      >
                        <option value="NOTA">NOTA</option>
                        <option value="FACTURA">FACTURA</option>
                        <option value="TICKET">TICKET</option>
                        <option value="RECIBO">RECIBO</option>
                      </select>
                    </td>
                    <td className="border p-2">
                      <Input 
                        type="number"
                        value={gasto.cantidad} 
                        onChange={(e) => updateGasto(index, 'cantidad', e.target.value)}
                        className="text-center"
                      />
                    </td>
                    <td className="border p-2">
                      <Input 
                        type="number"
                        value={gasto.precioUnitario || ''} 
                        onChange={(e) => updateGasto(index, 'precioUnitario', e.target.value)}
                        className="text-right"
                      />
                    </td>
                    <td className="border p-2 text-right font-bold">
                      ${gasto.importe.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                    </td>
                    <td className="border p-2">
                      <Input 
                        value={gasto.observaciones} 
                        onChange={(e) => updateGasto(index, 'observaciones', e.target.value)}
                        placeholder="Ej: PAGO EL ING. VLAS"
                      />
                    </td>
                    <td className="border p-2 text-center">
                      <Button variant="ghost" size="sm" onClick={() => removeGasto(index)} className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-50 font-bold">
                  <td colSpan={5} className="border p-3 text-right">TOTAL COMPROBADO:</td>
                  <td className="border p-3 text-right text-lg bg-green-100">
                    ${totalComprobado.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                  </td>
                  <td colSpan={2} className="border p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <Button onClick={addGasto} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" /> Agregar Gasto
          </Button>

          {/* Resumen de Saldos (igual al Excel) */}
          <div className="mt-6 grid grid-cols-2 gap-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-700 mb-2">Control de Saldos</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Saldo Anterior:</span>
                  <span className="font-mono">${saldoAnterior.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Importe Entregado:</span>
                  <span className="font-mono text-green-600">+${importeEntregado.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Total Disponible:</span>
                  <span className="font-mono">${(saldoAnterior + importeEntregado).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Total Comprobado:</span>
                  <span className="font-mono">-${totalComprobado.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Saldo en Caja:</span>
                  <span className={`font-mono ${saldoEnCaja >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${saldoEnCaja.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-end gap-4">
              <Button variant="outline" onClick={onCancel}>Cancelar</Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Guardar Caja Chica
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

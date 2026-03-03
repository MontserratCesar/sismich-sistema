import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import type { NominaEmpleado } from '@/types';

interface NominaFormProps {
  obraId: string;
  obraName: string;
  residenteName: string;
  onSave: (nomina: any) => void;
  onCancel: () => void;
}

export function NominaForm({ obraId, obraName, residenteName, onSave, onCancel }: NominaFormProps) {
  const [semanaDel, setSemanaDel] = useState('');
  const [semanaAl, setSemanaAl] = useState('');
  const [numeroSemana, setNumeroSemana] = useState(1);
  const [empleados, setEmpleados] = useState<NominaEmpleado[]>([
    {
      id: '1',
      nombre: '',
      puesto: '',
      dias: { lun: 0, mar: 0, mie: 0, jue: 0, vie: 0, sab: 0, dom: 0 },
      totalDias: 0,
      salarioDiario: 0,
      totalSemana: 0,
      observaciones: ''
    }
  ]);

  const diasSemana = [
    { key: 'vie', label: 'VIE' },
    { key: 'sab', label: 'SÁB' },
    { key: 'dom', label: 'DOM' },
    { key: 'lun', label: 'LUN' },
    { key: 'mar', label: 'MAR' },
    { key: 'mie', label: 'MIÉ' },
    { key: 'jue', label: 'JUE' }
  ];

  const addEmpleado = () => {
    const newId = (empleados.length + 1).toString();
    setEmpleados([...empleados, {
      id: newId,
      nombre: '',
      puesto: '',
      dias: { lun: 0, mar: 0, mie: 0, jue: 0, vie: 0, sab: 0, dom: 0 },
      totalDias: 0,
      salarioDiario: 0,
      totalSemana: 0,
      observaciones: ''
    }]);
  };

  const removeEmpleado = (index: number) => {
    if (empleados.length === 1) return;
    const updated = [...empleados];
    updated.splice(index, 1);
    // Renumerar
    updated.forEach((emp, idx) => emp.id = (idx + 1).toString());
    setEmpleados(updated);
  };

  const updateEmpleado = (index: number, field: string, value: any) => {
    const updated = [...empleados];
    updated[index] = { ...updated[index], [field]: value };
    setEmpleados(updated);
  };

  const updateDia = (empIndex: number, dia: string, value: string) => {
    const numValue = value === '' ? 0 : Math.min(Math.max(parseFloat(value), 0), 1);
    const updated = [...empleados];
    const newDias = { ...updated[empIndex].dias, [dia]: numValue };
    
    // Calcular totales automáticamente
    const totalDias = Object.values(newDias).reduce((sum, d) => sum + (Number(d) || 0), 0);
    const salarioDiario = updated[empIndex].salarioDiario;
    const totalSemana = totalDias * salarioDiario;
    
    updated[empIndex] = {
      ...updated[empIndex],
      dias: newDias,
      totalDias,
      totalSemana
    };
    
    setEmpleados(updated);
  };

  const updateSalario = (index: number, value: string) => {
    const salarioDiario = parseFloat(value) || 0;
    const updated = [...empleados];
    const totalDias = updated[index].totalDias;
    const totalSemana = totalDias * salarioDiario;
    
    updated[index] = {
      ...updated[index],
      salarioDiario,
      totalSemana
    };
    setEmpleados(updated);
  };

  const handleSubmit = () => {
    const totalNomina = empleados.reduce((sum, emp) => sum + emp.totalSemana, 0);
    
    onSave({
      obraId,
      obraName,
      semanaDel,
      semanaAl,
      numeroSemana,
      fechaElaboracion: new Date().toISOString().split('T')[0],
      empleados,
      totalNomina,
      elaboro: residenteName,
      estado: 'pendiente'
    });
  };

  const totalGeneral = empleados.reduce((sum, emp) => sum + emp.totalSemana, 0);

  return (
    <div className="space-y-6">
      {/* Encabezado igual al Excel */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">REPORTE SEMANAL DE MANO DE OBRA (NÓMINA SEMANAL)</h1>
            <p className="text-blue-100">CAMM CONSTRUCCIONES</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="text-blue-200">OBRA:</span> {obraName}</p>
            <p><span className="text-blue-200">MUNICIPIO:</span> MORELIA</p>
          </div>
          <div className="text-right">
            <p><span className="text-blue-200">RESIDENTE:</span> {residenteName}</p>
            <p><span className="text-blue-200">FECHA ELABORACIÓN:</span> {new Date().toLocaleDateString('es-MX')}</p>
          </div>
        </div>
      </div>

      {/* Datos del período */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Semana del:</Label>
              <Input type="date" value={semanaDel} onChange={(e) => setSemanaDel(e.target.value)} />
            </div>
            <div>
              <Label>Semana al:</Label>
              <Input type="date" value={semanaAl} onChange={(e) => setSemanaAl(e.target.value)} />
            </div>
            <div>
              <Label>Número de Semana:</Label>
              <Input type="number" value={numeroSemana} onChange={(e) => setNumeroSemana(parseInt(e.target.value))} min={1} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de empleados (igual al Excel) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Registro de Empleados</span>
            <Button onClick={addEmpleado} size="sm" className="bg-blue-600">
              <Plus className="w-4 h-4 mr-2" /> Agregar Empleado
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border p-2 text-sm">NÚM.</th>
                  <th className="border p-2 text-sm w-64">NOMBRE</th>
                  <th className="border p-2 text-sm w-48">PUESTO</th>
                  {diasSemana.map(d => (
                    <th key={d.key} className="border p-2 text-sm w-16">{d.label}</th>
                  ))}
                  <th className="border p-2 text-sm w-20">TOTAL DÍAS</th>
                  <th className="border p-2 text-sm w-28">SALARIO DIARIO</th>
                  <th className="border p-2 text-sm w-28">TOTAL</th>
                  <th className="border p-2 text-sm w-48">OBSERVACIONES</th>
                  <th className="border p-2 text-sm">ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((emp, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border p-2 text-center font-medium">{index + 1}</td>
                    <td className="border p-2">
                      <Input 
                        value={emp.nombre} 
                        onChange={(e) => updateEmpleado(index, 'nombre', e.target.value)}
                        className="w-full"
                        placeholder="Nombre completo"
                      />
                    </td>
                    <td className="border p-2">
                      <Input 
                        value={emp.puesto} 
                        onChange={(e) => updateEmpleado(index, 'puesto', e.target.value)}
                        className="w-full"
                        placeholder="Puesto"
                      />
                    </td>
                    {diasSemana.map(dia => (
                      <td key={dia.key} className="border p-1">
                        <Input
                          type="number"
                          min="0"
                          max="1"
                          step="0.5"
                          value={emp.dias[dia.key as keyof typeof emp.dias] || ''}
                          onChange={(e) => updateDia(index, dia.key, e.target.value)}
                          className="w-full text-center p-1"
                        />
                      </td>
                    ))}
                    <td className="border p-2 text-center font-bold">{emp.totalDias}</td>
                    <td className="border p-2">
                      <Input
                        type="number"
                        value={emp.salarioDiario || ''}
                        onChange={(e) => updateSalario(index, e.target.value)}
                        className="w-full text-right"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="border p-2 text-right font-bold">
                      ${emp.totalSemana.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                    </td>
                    <td className="border p-2">
                      <Input
                        value={emp.observaciones}
                        onChange={(e) => updateEmpleado(index, 'observaciones', e.target.value)}
                        className="w-full text-sm"
                        placeholder="Notas..."
                      />
                    </td>
                    <td className="border p-2 text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeEmpleado(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-50 font-bold">
                  <td colSpan={9} className="border p-3 text-right">TOTAL DE NÓMINA:</td>
                  <td className="border p-3 text-right text-lg bg-blue-100">
                    ${totalGeneral.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                  </td>
                  <td colSpan={2} className="border p-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Firmas (igual al Excel) */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2">
                <p className="font-bold">{residenteName}</p>
                <p className="text-sm text-gray-600">ELABORÓ</p>
                <p className="text-xs text-gray-500">RESIDENTE DE OBRA</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2">
                <p className="font-bold text-gray-400">_________________</p>
                <p className="text-sm text-gray-600">REVISÓ</p>
                <p className="text-xs text-gray-500">SUPERINTENDENTE</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-400 pt-2">
                <p className="font-bold text-gray-400">_________________</p>
                <p className="text-sm text-gray-600">AUTORIZÓ</p>
                <p className="text-xs text-gray-500">DIRECTOR GENERAL</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Guardar Nómina
        </Button>
      </div>
    </div>
  );
}
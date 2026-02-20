import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  DollarSign, 
  Building2,
  User,
  Download,
  CheckCircle2,
  Clock,
  CheckCircle
} from 'lucide-react';
import type { Nomina, Obra, User as UserType } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface NominaDetailProps {
  nomina: Nomina;
  obra: Obra | undefined;
  currentUser: UserType;
  onBack: () => void;
  onValidar: (id: string) => void;
  onAutorizar: (id: string) => void;
  onPagar: (id: string) => void;
}

export function NominaDetail({ 
  nomina, 
  obra, 
  currentUser, 
  onBack, 
  onValidar, 
  onAutorizar, 
  onPagar 
}: NominaDetailProps) {
  const nominaRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const exportToPDF = async () => {
    if (!nominaRef.current) return;
    
    const canvas = await html2canvas(nominaRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Nomina_${nomina.obraName}_${nomina.semanaDel}.pdf`);
  };

  const semanaDel = new Date(nomina.semanaDel);
  const diasSemana = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
  const fechasDias = diasSemana.map((_, i) => {
    const d = new Date(semanaDel);
    d.setDate(d.getDate() + i);
    return d.getDate().toString().padStart(2, '0');
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Nómina Semanal</h2>
          <p className="text-gray-500">
            Semana del {new Date(nomina.semanaDel).toLocaleDateString('es-MX')} al {new Date(nomina.semanaAl).toLocaleDateString('es-MX')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          {nomina.estado === 'pendiente' && currentUser.id === nomina.residenteId && (
            <Button onClick={() => onValidar(nomina.id)} className="bg-blue-500 hover:bg-blue-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              Validar
            </Button>
          )}
          {nomina.estado === 'validada' && currentUser.role === 'admin' && (
            <Button onClick={() => onAutorizar(nomina.id)} className="bg-purple-500 hover:bg-purple-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              Autorizar
            </Button>
          )}
          {nomina.estado === 'autorizada' && currentUser.role === 'contadora' && (
            <Button onClick={() => onPagar(nomina.id)} className="bg-emerald-500 hover:bg-emerald-600">
              <DollarSign className="w-4 h-4 mr-2" />
              Registrar Pago
            </Button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Obra</p>
                <p className="font-semibold">{nomina.obraName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Residente</p>
                <p className="font-semibold">{nomina.residenteName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Nómina</p>
                <p className="font-bold text-emerald-600">{formatCurrency(nomina.totalNomina)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                nomina.estado === 'pagada' ? 'bg-emerald-100' :
                nomina.estado === 'autorizada' ? 'bg-purple-100' :
                nomina.estado === 'validada' ? 'bg-blue-100' :
                'bg-amber-100'
              }`}>
                <CheckCircle2 className={`w-5 h-5 ${
                  nomina.estado === 'pagada' ? 'text-emerald-600' :
                  nomina.estado === 'autorizada' ? 'text-purple-600' :
                  nomina.estado === 'validada' ? 'text-blue-600' :
                  'text-amber-600'
                }`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <Badge 
                  variant="outline"
                  className={
                    nomina.estado === 'pagada' ? 'text-emerald-600 border-emerald-200' :
                    nomina.estado === 'autorizada' ? 'text-purple-600 border-purple-200' :
                    nomina.estado === 'validada' ? 'text-blue-600 border-blue-200' :
                    'text-amber-600 border-amber-200'
                  }
                >
                  {nomina.estado.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Estados */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Flujo de Aprobación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {[
              { estado: 'pendiente', label: 'Pendiente', fecha: nomina.createdAt },
              { estado: 'validada', label: 'Validada', fecha: nomina.validadaAt },
              { estado: 'autorizada', label: 'Autorizada', fecha: nomina.autorizadaAt },
              { estado: 'pagada', label: 'Pagada', fecha: nomina.pagadaAt },
            ].map((step, index, arr) => {
              const isActive = nomina.estado === step.estado || 
                (step.estado === 'pendiente' && ['validada', 'autorizada', 'pagada'].includes(nomina.estado)) ||
                (step.estado === 'validada' && ['autorizada', 'pagada'].includes(nomina.estado)) ||
                (step.estado === 'autorizada' && ['pagada'].includes(nomina.estado));
              const isCompleted = ['validada', 'autorizada', 'pagada'].includes(nomina.estado) && step.estado === 'pendiente' ||
                ['autorizada', 'pagada'].includes(nomina.estado) && step.estado === 'validada' ||
                ['pagada'].includes(nomina.estado) && step.estado === 'autorizada';
              
              return (
                <div key={step.estado} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center ${index < arr.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-emerald-500 text-white' :
                      isActive ? 'bg-amber-500 text-white' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <p className={`text-sm mt-2 font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {step.fecha && (
                      <p className="text-xs text-gray-500">
                        {new Date(step.fecha).toLocaleDateString('es-MX')}
                      </p>
                    )}
                  </div>
                  {index < arr.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Nómina - Formato SISMICH */}
      <div ref={nominaRef} className="bg-white p-8 shadow-lg rounded-lg">
        {/* Header del formato */}
        <div className="text-center mb-6 border-b-2 border-amber-500 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">SISMICH</h1>
          <p className="text-gray-600">NÓMINA SEMANAL DE OBRA</p>
          <div className="flex justify-between mt-4 text-sm">
            <div>
              <p><strong>OBRA:</strong> {nomina.obraName}</p>
              <p><strong>UBICACIÓN:</strong> {obra?.ubicacion}</p>
            </div>
            <div className="text-right">
              <p><strong>PERÍODO:</strong> DEL {new Date(nomina.semanaDel).toLocaleDateString('es-MX')} AL {new Date(nomina.semanaAl).toLocaleDateString('es-MX')}</p>
              <p><strong>FECHA DE ELABORACIÓN:</strong> {new Date(nomina.fechaElaboracion).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <table className="w-full border-collapse border-2 border-gray-800">
          <thead>
            <tr className="bg-amber-500 text-white">
              <th className="border-2 border-gray-800 px-2 py-3 text-sm" rowSpan={2}>No.</th>
              <th className="border-2 border-gray-800 px-2 py-3 text-sm" rowSpan={2}>NOMBRE</th>
              <th className="border-2 border-gray-800 px-2 py-3 text-sm" rowSpan={2}>PUESTO</th>
              <th className="border-2 border-gray-800 px-2 py-3 text-sm text-center" colSpan={7}>DÍAS LABORADOS</th>
              <th className="border-2 border-gray-800 px-2 py-3 text-sm" rowSpan={2}>TOTAL DÍAS LABORADOS</th>
              <th className="border-2 border-gray-800 px-2 py-3 text-sm" rowSpan={2}>SALARIO DIARIO</th>
              <th className="border-2 border-gray-800 px-2 py-3 text-sm" rowSpan={2}>TOTAL SEMANA</th>
              <th className="border-2 border-gray-800 px-2 py-3 text-sm" rowSpan={2}>OBSERVACIONES</th>
            </tr>
            <tr className="bg-amber-400 text-white">
              {diasSemana.map((dia, i) => (
                <th key={dia} className="border-2 border-gray-800 px-2 py-2 text-xs">
                  <div>{dia}</div>
                  <div className="text-xs opacity-75">{fechasDias[i]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {nomina.empleados.map((emp, index) => (
              <tr key={emp.id} className="hover:bg-gray-50">
                <td className="border border-gray-400 px-2 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-400 px-2 py-2">{emp.nombre}</td>
                <td className="border border-gray-400 px-2 py-2">{emp.puesto}</td>
                {(['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'] as const).map(dia => (
                  <td key={dia} className="border border-gray-400 px-2 py-2 text-center">
                    {emp.dias[dia] > 0 ? '1' : ''}
                  </td>
                ))}
                <td className="border border-gray-400 px-2 py-2 text-center font-semibold">{emp.totalDias}</td>
                <td className="border border-gray-400 px-2 py-2 text-right">{formatCurrency(emp.salarioDiario)}</td>
                <td className="border border-gray-400 px-2 py-2 text-right font-semibold">{formatCurrency(emp.totalSemana)}</td>
                <td className="border border-gray-400 px-2 py-2 text-sm">{emp.observaciones}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-amber-100 font-bold">
              <td className="border-2 border-gray-800 px-4 py-3 text-right" colSpan={12}>
                TOTAL NÓMINA:
              </td>
              <td className="border-2 border-gray-800 px-4 py-3 text-right text-emerald-700">
                {formatCurrency(nomina.totalNomina)}
              </td>
              <td className="border-2 border-gray-800 px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>

        {/* Firmas */}
        <div className="mt-12 grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="font-semibold">{nomina.residenteName}</p>
              <p className="text-sm text-gray-500">Residente de Obra</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="font-semibold">Contadora</p>
              <p className="text-sm text-gray-500">Revisó</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2">
              <p className="font-semibold">Administrador</p>
              <p className="text-sm text-gray-500">Autorizó</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

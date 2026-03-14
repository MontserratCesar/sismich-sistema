import { 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  AlertCircle,
  ArrowRight,
  Building2,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Nomina, Obra } from '@/types';

interface ContadoraDashboardProps {
  obras: Obra[];
  nominas: Nomina[];
  onViewNomina: (nominaId: string) => void;
  onValidarNomina?: (id: string) => void; // Agrega esta prop en App.tsx si no existe
}

export function ContadoraDashboard({ 
  obras, 
  nominas, 
  onViewNomina,
  onValidarNomina 
}: ContadoraDashboardProps) {
  
  // Filtrar nóminas por estado
  const nominasPendientes = nominas.filter(n => n.estado === 'pendiente');
  const nominasValidadas = nominas.filter(n => n.estado === 'validada');
  const nominasAutorizadas = nominas.filter(n => n.estado === 'autorizada');
  const nominasPagadas = nominas.filter(n => n.estado === 'pagada');

  // Calcular montos
  const totalPorPagar = nominasAutorizadas.reduce((sum, n) => sum + n.totalNomina, 0);
  const totalPagadoMes = nominasPagadas
    .filter(n => {
      const fecha = new Date(n.pagadaAt || n.updatedAt);
      const hoy = new Date();
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    })
    .reduce((sum, n) => sum + n.totalNomina, 0);

  const getObraName = (obraId: string) => {
    return obras.find(o => o.id === obraId)?.nombre || 'Obra desconocida';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Panel de Contadora</h1>
        <p className="text-purple-100">Gestión de pagos y validaciones</p>
      </div>

      {/* Pipeline de Estados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Por Validar</p>
                <p className="text-3xl font-bold text-gray-900">{nominasPendientes.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Esperando tu revisión</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Validadas</p>
                <p className="text-3xl font-bold text-gray-900">{nominasValidadas.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Listas para autorización</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Por Pagar</p>
                <p className="text-3xl font-bold text-gray-900">{nominasAutorizadas.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total: ${totalPorPagar.toLocaleString('es-MX')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Pagadas (Mes)</p>
                <p className="text-3xl font-bold text-gray-900">{nominasPagadas.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Total: ${totalPagadoMes.toLocaleString('es-MX')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Acciones Urgentes */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Nóminas Pendientes de Validación
          </h2>

          {nominasPendientes.length === 0 ? (
            <Card className="p-8 text-center bg-green-50 border-green-200">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-800 font-medium">¡Todas las nóminas validadas!</p>
              <p className="text-sm text-green-600">No hay nóminas esperando revisión.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {nominasPendientes.map(nomina => (
                <Card key={nomina.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {getObraName(nomina.obraId)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Semana {nomina.numeroSemana} • {nomina.semanaDel} al {nomina.semanaAl}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {nomina.empleados.length} empleados
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Elaboró: {nomina.residenteName}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${nomina.totalNomina.toLocaleString('es-MX')}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => onViewNomina(nomina.id)}
                          >
                            Revisar Detalle
                            <ArrowRight className="w-4 h-4 ml-1" /> 
                          </Button>
                          
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Nóminas Autorizadas (Esperando Pago) */}
          {nominasAutorizadas.length > 0 && (
            <>
              <h2 className="text-xl font-bold mt-8 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-500" />
                Autorizadas - Listas para Pagar
              </h2>
              <div className="space-y-3">
                {nominasAutorizadas.map(nomina => (
                  <Card key={nomina.id} className="border-purple-200 bg-purple-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{getObraName(nomina.obraId)}</h3>
                          <p className="text-sm text-gray-600">Semana {nomina.numeroSemana}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-purple-700">
                            ${nomina.totalNomina.toLocaleString('es-MX')}
                          </p>
                          <span className="text-xs text-purple-600">Esperando pago del Admin</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Resumen de Obras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Obras Activas</span>
                  <span className="font-bold text-lg">{obras.filter(o => o.estado === 'activa').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm">Total Nóminas (Mes)</span>
                  <span className="font-bold text-lg">
                    {nominas.filter(n => {
                      const d = new Date(n.createdAt);
                      const hoy = new Date();
                      return d.getMonth() === hoy.getMonth();
                    }).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Proceso de Validación
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  Revisa la nómina del residente
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  Valida montos y asistencias
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  Marca como "Validada" para autorización
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
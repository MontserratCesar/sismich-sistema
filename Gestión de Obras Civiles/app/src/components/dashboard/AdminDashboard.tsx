import { 
  Building2, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Users,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Obra, Nomina, User } from '@/types';

interface AdminDashboardProps {
  obras: Obra[];
  nominas: Nomina[];
  users: User[];
  onViewObra: (obraId: string) => void;
  onViewNomina: (nominaId: string) => void;
}

export function AdminDashboard({ 
  obras, 
  nominas, 
  onViewObra, 
  onViewNomina 
}: AdminDashboardProps) {
  
  // Filtrar nóminas por acción requerida
  const nominasPendientesValidar = nominas.filter(n => n.estado === 'pendiente');
  const nominasPendientesAutorizar = nominas.filter(n => n.estado === 'validada');
  const nominasPendientesPago = nominas.filter(n => n.estado === 'autorizada');
  
  const totalPorPagar = nominasPendientesPago.reduce((sum, n) => sum + n.totalNomina, 0);
  
  // Stats
  const obrasActivas = obras.filter(o => o.estado === 'activa');
  const presupuestoTotal = obras.reduce((sum, o) => sum + (o.presupuesto?.totalPresupuesto || 0), 0);
  const manoObraPagada = obras.reduce((sum, o) => sum + (o.gastoRealManoObra || 0), 0);

  const getObraName = (obraId: string) => {
    return obras.find(o => o.id === obraId)?.nombre || 'Obra desconocida';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-blue-100">Control general de obras y finanzas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Obras</p>
                <p className="text-3xl font-bold text-gray-900">{obras.length}</p>
                <p className="text-xs text-gray-500">{obrasActivas.length} activas • {obras.filter(o => o.estado === 'terminada').length} terminadas</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Presupuesto Total</p>
                <p className="text-3xl font-bold text-gray-900">${presupuestoTotal.toLocaleString('es-MX')}</p>
                <p className="text-xs text-gray-500">En {obras.length} obras</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Mano de Obra Pagada</p>
                <p className="text-3xl font-bold text-gray-900">${manoObraPagada.toLocaleString('es-MX')}</p>
                <p className="text-xs text-gray-500">Total ejecutado</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={nominasPendientesValidar.length + nominasPendientesAutorizar.length > 0 ? 'border-amber-400' : ''}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Nóminas por Acción</p>
                <p className="text-3xl font-bold text-gray-900">
                  {nominasPendientesValidar.length + nominasPendientesAutorizar.length + nominasPendientesPago.length}
                </p>
                <p className="text-xs text-gray-500">
                  {nominasPendientesValidar.length} por validar • {nominasPendientesAutorizar.length} por autorizar • {nominasPendientesPago.length} por pagar
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Pipeline de Nóminas */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Sección: Nóminas Pendientes de Validar (Esperan a la Contadora, pero Admin puede ver) */}
          {nominasPendientesValidar.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2 text-amber-700">
                <Clock className="w-5 h-5" />
                Pendientes de Validar ({nominasPendientesValidar.length})
              </h2>
              <p className="text-sm text-gray-500">La contadora está revisando estas nóminas</p>
              
              {nominasPendientesValidar.map(nomina => (
                <Card key={nomina.id} className="border-amber-200 bg-amber-50/30">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-900">{getObraName(nomina.obraId)}</h3>
                        <p className="text-sm text-gray-600">
                          Semana {nomina.numeroSemana} • {nomina.empleados.length} empleados • Total: ${nomina.totalNomina.toLocaleString('es-MX')}
                        </p>
                        <Badge variant="outline" className="mt-2 text-amber-600 border-amber-300">
                          Esperando validación de contadora
                        </Badge>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => onViewNomina(nomina.id)}
                      >
                        Ver Detalle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Sección: Nóminas Validadas (Requieren Autorización del Admin) */}
          {nominasPendientesAutorizar.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2 text-blue-700">
                <CheckCircle2 className="w-5 h-5" />
                Validadas - Requieren tu Autorización ({nominasPendientesAutorizar.length})
              </h2>
              
              {nominasPendientesAutorizar.map(nomina => (
                <Card key={nomina.id} className="border-blue-200 bg-blue-50/30 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-900">{getObraName(nomina.obraId)}</h3>
                        <p className="text-sm text-gray-600">
                          Semana {nomina.numeroSemana} • Validada el {new Date(nomina.validadaAt || '').toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            Por Autorizar
                          </Badge>
                          <span className="text-sm font-bold text-blue-900">
                            ${nomina.totalNomina.toLocaleString('es-MX')}
                          </span>
                        </div>
                      </div>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => onViewNomina(nomina.id)}
                      >
                        Autorizar Pago
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Sección: Nóminas Autorizadas (Listas para Pagar) */}
          {nominasPendientesPago.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2 text-purple-700">
                <DollarSign className="w-5 h-5" />
                Autorizadas - Listas para Pagar ({nominasPendientesPago.length})
              </h2>
              
              {nominasPendientesPago.map(nomina => (
                <Card key={nomina.id} className="border-purple-200 bg-purple-50/30">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-gray-900">{getObraName(nomina.obraId)}</h3>
                        <p className="text-sm text-gray-600">
                          Semana {nomina.numeroSemana} • Autorizada el {new Date(nomina.autorizadaAt || '').toLocaleDateString()}
                        </p>
                        <Badge className="mt-2 bg-purple-100 text-purple-800">
                          Esperando pago
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-purple-900">
                          ${nomina.totalNomina.toLocaleString('es-MX')}
                        </p>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="mt-1"
                          onClick={() => onViewNomina(nomina.id)}
                        >
                          Ver para Pagar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-purple-100">Total por Pagar</p>
                      <p className="text-2xl font-bold">${totalPorPagar.toLocaleString('es-MX')}</p>
                    </div>
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        // Aquí podrías hacer un pago masivo o ver el detalle de todas
                        if (nominasPendientesPago.length > 0) onViewNomina(nominasPendientesPago[0].id);
                      }}
                    >
                      Procesar Pagos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sin nóminas pendientes */}
          {nominasPendientesValidar.length === 0 && 
           nominasPendientesAutorizar.length === 0 && 
           nominasPendientesPago.length === 0 && (
            <Card className="p-8 text-center bg-green-50 border-green-200">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-800 font-medium">¡Todas las nóminas están pagadas!</p>
              <p className="text-sm text-green-600">No hay acciones pendientes</p>
            </Card>
          )}
        </div>

        {/* Columna derecha: Obras y Alertas */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Obras Activas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {obrasActivas.map(obra => (
                <div 
                  key={obra.id} 
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onViewObra(obra.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{obra.nombre}</h4>
                      <p className="text-xs text-gray-500">{obra.ubicacion}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Avance</span>
                      <span>{obra.avanceFisicoGlobal || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${obra.avanceFisicoGlobal || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {obrasActivas.length === 0 && (
                <p className="text-gray-500 text-center py-4">No hay obras activas</p>
              )}
            </CardContent>
          </Card>

          {/* Alertas de Presupuesto */}
          {obras.filter(o => o.avanceFinancieroGlobal > 100).length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Alertas de Presupuesto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {obras
                  .filter(o => o.avanceFinancieroGlobal > 100)
                  .map(obra => (
                    <div key={obra.id} className="mb-2 p-2 bg-red-100 rounded text-sm">
                      <p className="font-bold text-red-900">{obra.nombre}</p>
                      <p className="text-red-700">Gasto excede presupuesto en {Math.round((obra.avanceFinancieroGlobal || 0) - 100)}%</p>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
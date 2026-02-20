import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wallet
} from 'lucide-react';
import type { Obra, Nomina, User } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';

interface AdminDashboardProps {
  obras: Obra[];
  nominas: Nomina[];
  users: User[];
}

export function AdminDashboard({ obras, nominas, users }: AdminDashboardProps) {
  const { getDashboardStats, getObraFinanzas, getAlertasFinancieras } = useDashboard();

  const stats = useMemo(() => getDashboardStats(obras, nominas), [obras, nominas, getDashboardStats]);
  const alertas = useMemo(() => getAlertasFinancieras(obras, nominas), [obras, nominas, getAlertasFinancieras]);

  const residentes = users.filter(u => u.role === 'residente' && u.isActive);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Obras</p>
                <p className="text-3xl font-bold">{stats.totalObras}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="bg-white/20 px-2 py-0.5 rounded">{stats.obrasActivas} activas</span>
              <span className="bg-white/20 px-2 py-0.5 rounded">{stats.obrasTerminadas} terminadas</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Inversión Total</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalInversion)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-amber-100">
              Presupuesto acumulado de todas las obras
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Mano de Obra</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalManoObra)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-emerald-100">
              Total pagado en nóminas
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg ${stats.gananciaPerdida >= 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{stats.gananciaPerdida >= 0 ? 'Proyección de Ganancia' : 'Proyección de Pérdida'}</p>
                <p className="text-3xl font-bold">{formatCurrency(Math.abs(stats.gananciaPerdida))}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {stats.gananciaPerdida >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
              </div>
            </div>
            <div className="mt-4 text-sm text-white/80">
              Basado en presupuesto vs gastos
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y Nóminas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas Financieras */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alertas Financieras
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alertas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <p>No hay alertas financieras</p>
                <p className="text-sm">Todas las obras están dentro de los parámetros normales</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertas.map((alerta, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-l-4 ${
                      alerta.tipo === 'critico'
                        ? 'bg-red-50 border-red-500'
                        : alerta.tipo === 'advertencia'
                        ? 'bg-amber-50 border-amber-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{alerta.obra.nombre}</p>
                        <p className={`text-sm ${
                          alerta.tipo === 'critico' ? 'text-red-600' : 
                          alerta.tipo === 'advertencia' ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          {alerta.mensaje}
                        </p>
                      </div>
                      <Badge variant={alerta.tipo === 'critico' ? 'destructive' : alerta.tipo === 'advertencia' ? 'default' : 'secondary'}>
                        {alerta.tipo === 'critico' ? 'Crítico' : alerta.tipo === 'advertencia' ? 'Advertencia' : 'Info'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estado de Nóminas */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-amber-500" />
              Estado de Nóminas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span className="text-gray-700">Pendientes</span>
                </div>
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                  {stats.nominasPendientes}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-700">Validadas</span>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                  {nominas.filter(n => n.estado === 'validada').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-500" />
                  <span className="text-gray-700">Autorizadas</span>
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                  {stats.nominasAutorizadas}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-gray-700">Pagadas</span>
                </div>
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                  {nominas.filter(n => n.estado === 'pagada').length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Obras Activas */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-amber-500" />
            Obras Activas - Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {obras.filter(o => o.estado === 'activa').map(obra => {
              const finanzas = getObraFinanzas(obra, nominas);
              return (
                <div key={obra.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{obra.nombre}</p>
                      <p className="text-sm text-gray-500">{obra.ubicacion}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Presupuesto</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(obra.presupuesto)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Avance Físico</p>
                      <div className="flex items-center gap-2">
                        <Progress value={finanzas.avanceFisico} className="h-2 flex-1" />
                        <span className="text-sm font-medium w-12 text-right">{finanzas.avanceFisico.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Avance Financiero</p>
                      <div className="flex items-center gap-2">
                        <Progress value={finanzas.avanceFinanciero} className="h-2 flex-1" />
                        <span className="text-sm font-medium w-12 text-right">{finanzas.avanceFinanciero.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">ROI Estimado</p>
                      <div className={`flex items-center gap-2 font-medium ${finanzas.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {finanzas.roi >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{finanzas.roi.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      Mano de obra: <span className="font-medium text-gray-900">{formatCurrency(finanzas.manoObraTotal)}</span>
                    </span>
                    <span className="text-gray-500">
                      Materiales: <span className="font-medium text-gray-900">{formatCurrency(finanzas.materialesTotal)}</span>
                    </span>
                    <span className={`ml-auto font-medium ${finanzas.desviacionPresupuestal > 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                      Desv. {finanzas.desviacionPresupuestal > 0 ? '+' : ''}{finanzas.desviacionPresupuestal.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
            {obras.filter(o => o.estado === 'activa').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No hay obras activas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Residentes */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-amber-500" />
            Residentes de Obra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {residentes.map(residente => {
              const obrasResidente = obras.filter(o => o.residenteId === residente.id);
              return (
                <div key={residente.id} className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{residente.name}</p>
                      <p className="text-sm text-gray-500">{residente.email || 'Sin email'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-amber-600 border-amber-200">
                      {obrasResidente.length} obras
                    </Badge>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                      {obrasResidente.filter(o => o.estado === 'activa').length} activas
                    </Badge>
                  </div>
                </div>
              );
            })}
            {residentes.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>No hay residentes registrados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

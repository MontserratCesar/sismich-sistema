import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  DollarSign, 
  Users, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  AlertOctagon
} from 'lucide-react';
import type { Obra, Nomina, User } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';
import { AlertasObra } from '@/components/alertas/AlertasObra';

interface AdminDashboardProps {
  obras: Obra[];
  nominas: Nomina[];
  users: User[];
}

export function AdminDashboard({ obras, nominas, users }: AdminDashboardProps) {
  const { getObraFinanzas } = useDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Estadísticas generales
  const stats = useMemo(() => {
    const obrasActivas = obras.filter(o => o.estado === 'activa');
    const totalPresupuesto = obras.reduce((sum, o) => sum + (o.presupuesto?.totalPresupuesto || 0), 0);
    const totalManoObra = nominas
      .filter(n => n.estado === 'pagada')
      .reduce((sum, n) => sum + n.totalNomina, 0);
    
    return {
      totalObras: obras.length,
      obrasActivas: obrasActivas.length,
      obrasTerminadas: obras.filter(o => o.estado === 'terminada').length,
      totalPresupuesto,
      totalManoObra,
      nominasPendientes: nominas.filter(n => n.estado === 'pendiente').length,
      nominasPorAutorizar: nominas.filter(n => n.estado === 'validada').length,
    };
  }, [obras, nominas]);

  // Obras con alertas (problemas)
  const obrasConAlertas = useMemo(() => {
    return obras.filter(obra => {
      const avanceFisico = obra.avanceFisicoGlobal || 0;
      const avanceFinanciero = obra.avanceFinancieroGlobal || 0;
      const presupuesto = obra.presupuesto?.totalPresupuesto || 0;
      
      if (!presupuesto || presupuesto === 0) return false;
      
      const ratio = avanceFinanciero > 0 ? (avanceFisico / avanceFinanciero) : 1;
      return ratio < 1.0; // Solo mostrar las que tienen problemas o atención
    }).sort((a, b) => {
      // Ordenar por gravedad (peores primero)
      const ratioA = (a.avanceFisicoGlobal || 0) / (a.avanceFinancieroGlobal || 1);
      const ratioB = (b.avanceFisicoGlobal || 0) / (b.avanceFinancieroGlobal || 1);
      return ratioA - ratioB;
    });
  }, [obras]);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Panel de Administración</h2>
        <p className="text-blue-100">Control general de obras y finanzas</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Obras</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalObras}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {stats.obrasActivas} activas • {stats.obrasTerminadas} terminadas
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Presupuesto Total</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalPresupuesto)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              En {stats.totalObras} obras
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Mano de Obra Pagada</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalManoObra)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Total ejecutado
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Nóminas por Acción</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.nominasPendientes + stats.nominasPorAutorizar}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {stats.nominasPendientes} por validar • {stats.nominasPorAutorizar} por autorizar
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECCIÓN DE ALERTAS - PARA OBRAS CON PROBLEMAS */}
      {obrasConAlertas.length > 0 && (
        <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
          <CardHeader className="pb-2 bg-red-50">
            <CardTitle className="flex items-center gap-2 text-lg text-red-800">
              <AlertOctagon className="w-5 h-5" />
              Alertas de Obras ({obrasConAlertas.length})
            </CardTitle>
            <p className="text-sm text-red-600">
              Obras que requieren atención por desviación presupuestal
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {obrasConAlertas.slice(0, 3).map(obra => (
              <AlertasObra key={obra.id} obra={obra} />
            ))}
            {obrasConAlertas.length > 3 && (
              <p className="text-center text-sm text-gray-500 pt-2">
                Y {obrasConAlertas.length - 3} obras más con alertas...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumen de Obras Activas */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Obras Activas - Resumen Financiero
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {obras.filter(o => o.estado === 'activa').map(obra => {
              const finanzas = getObraFinanzas(obra, nominas);
              const avanceFisico = obra.avanceFisicoGlobal || 0;
              const avanceFinanciero = obra.avanceFinancieroGlobal || 0;
              const ratio = avanceFinanciero > 0 ? (avanceFisico / avanceFinanciero) : 1;
              
              // Determinar color de estado
              let statusColor = 'bg-green-100 text-green-800';
              let statusText = 'Saludable';
              if (ratio < 0.85) {
                statusColor = 'bg-red-100 text-red-800';
                statusText = 'Crítica';
              } else if (ratio < 1.0) {
                statusColor = 'bg-yellow-100 text-yellow-800';
                statusText = 'Atención';
              }
              
              return (
                <div 
                  key={obra.id} 
                  className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">{obra.nombre}</p>
                      <Badge className={statusColor}>{statusText}</Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver detalles <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  
                  {/* Alerta específica de esta obra */}
                  <div className="mb-3">
                    <AlertasObra obra={obra} />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Presupuesto</p>
                      <p className="font-medium">{formatCurrency(obra.presupuesto?.totalPresupuesto || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Gasto Real</p>
                      <p className="font-medium text-red-600">{formatCurrency(finanzas.gastosTotal)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Avance Físico</p>
                      <div className="flex items-center gap-2">
                        <Progress value={avanceFisico} className="h-2 flex-1" />
                        <span className="text-xs">{avanceFisico.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Avance Financiero</p>
                      <div className="flex items-center gap-2">
                        <Progress value={avanceFinanciero} className="h-2 flex-1" />
                        <span className="text-xs">{avanceFinanciero.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {obras.filter(o => o.estado === 'activa').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay obras activas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  CheckCircle2,
  Clock,
  Building2,
  ArrowRight,
  FileText
} from 'lucide-react';
import type { Obra, Nomina } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';

interface ContadoraDashboardProps {
  obras: Obra[];
  nominas: Nomina[];
  onViewNomina: (nominaId: string) => void;
}

export function ContadoraDashboard({ obras, nominas, onViewNomina }: ContadoraDashboardProps) {
  const { getDashboardStats } = useDashboard();

  const stats = useMemo(() => getDashboardStats(obras, nominas), [obras, nominas, getDashboardStats]);

  const nominasAutorizadas = useMemo(() => 
    nominas.filter(n => n.estado === 'autorizada'),
    [nominas]
  );

  const nominasPagadas = useMemo(() => 
    nominas.filter(n => n.estado === 'pagada'),
    [nominas]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalPorPagar = nominasAutorizadas.reduce((sum, n) => sum + n.totalNomina, 0);
  const totalPagado = nominasPagadas.reduce((sum, n) => sum + n.totalNomina, 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Panel de Contadora</h2>
        <p className="text-purple-100">Gestión de pagos y finanzas</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Por Pagar</p>
                <p className="text-3xl font-bold">{formatCurrency(totalPorPagar)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-purple-100">
              {nominasAutorizadas.length} nóminas autorizadas
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Pagado</p>
                <p className="text-3xl font-bold">{formatCurrency(totalPagado)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-sm text-emerald-100">
              {nominasPagadas.length} nóminas pagadas
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Mano de Obra Total</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalManoObra)}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Todas las obras
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Obras Activas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.obrasActivas}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              En progreso
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nóminas Autorizadas - Por Pagar */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-purple-500" />
            Nóminas Autorizadas - Listas para Pagar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nominasAutorizadas.map(nomina => (
              <div 
                key={nomina.id} 
                className="flex items-center justify-between p-4 border border-purple-100 rounded-xl bg-purple-50/50 hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Semana del {new Date(nomina.semanaDel).toLocaleDateString('es-MX')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {nomina.obraName} • {nomina.empleados.length} empleados • {nomina.residenteName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(nomina.totalNomina)}</p>
                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                      Autorizada
                    </Badge>
                  </div>
                  <Button size="sm" onClick={() => onViewNomina(nomina.id)}>
                    Pagar <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
            {nominasAutorizadas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
                <p>No hay nóminas autorizadas pendientes de pago</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historial de Pagos */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-emerald-500" />
            Historial de Pagos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nominasPagadas.slice(0, 5).map(nomina => (
              <div 
                key={nomina.id} 
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Semana del {new Date(nomina.semanaDel).toLocaleDateString('es-MX')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {nomina.obraName} • Pagada el {nomina.pagadaAt ? new Date(nomina.pagadaAt).toLocaleDateString('es-MX') : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(nomina.totalNomina)}</p>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    Pagada
                  </Badge>
                </div>
              </div>
            ))}
            {nominasPagadas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay pagos registrados</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

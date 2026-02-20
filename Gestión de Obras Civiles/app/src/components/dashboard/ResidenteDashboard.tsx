import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  DollarSign, 
  Users, 
  Clock,
  CheckCircle2,
  FileText,
  Plus,
  ArrowRight
} from 'lucide-react';
import type { Obra, Nomina, User } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';

interface ResidenteDashboardProps {
  user: User;
  obras: Obra[];
  nominas: Nomina[];
  onViewObra: (obraId: string) => void;
  onCreateNomina: () => void;
}

export function ResidenteDashboard({ user, obras, nominas, onViewObra, onCreateNomina }: ResidenteDashboardProps) {
  const { getObraFinanzas } = useDashboard();

  const misObras = useMemo(() => 
    obras.filter(o => o.residenteId === user.id),
    [obras, user.id]
  );

  const misNominas = useMemo(() => 
    nominas.filter(n => n.residenteId === user.id),
    [nominas, user.id]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalManoObra = misNominas
    .filter(n => n.estado === 'pagada' || n.estado === 'autorizada')
    .reduce((sum, n) => sum + n.totalNomina, 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">¡Bienvenido, {user.name}!</h2>
        <p className="text-amber-100">Residente de Obra - Panel de Control</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Mis Obras</p>
                <p className="text-3xl font-bold text-gray-900">{misObras.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {misObras.filter(o => o.estado === 'activa').length} activas
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Mano de Obra</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalManoObra)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Total en nóminas pagadas
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Nóminas Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {misNominas.filter(n => n.estado === 'pendiente').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Por validar
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Nóminas Validadas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {misNominas.filter(n => n.estado === 'validada').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              En espera de autorización
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mis Obras */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-amber-500" />
            Mis Obras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {misObras.map(obra => {
              const finanzas = getObraFinanzas(obra, nominas);
              const obraNominas = nominas.filter(n => n.obraId === obra.id);
              return (
                <div 
                  key={obra.id} 
                  className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onViewObra(obra.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{obra.nombre}</p>
                        <Badge variant={obra.estado === 'activa' ? 'default' : 'secondary'}>
                          {obra.estado}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{obra.ubicacion}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver detalles <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Presupuesto</p>
                      <p className="font-medium text-gray-900">{formatCurrency(obra.presupuesto)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avance Físico</p>
                      <div className="flex items-center gap-2">
                        <Progress value={finanzas.avanceFisico} className="h-2 flex-1" />
                        <span className="text-sm">{finanzas.avanceFisico.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Mano de Obra</p>
                      <p className="font-medium text-gray-900">{formatCurrency(finanzas.manoObraTotal)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nóminas</p>
                      <p className="font-medium text-gray-900">{obraNominas.length}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {misObras.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No tienes obras asignadas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mis Nóminas Recientes */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5 text-amber-500" />
            Mis Nóminas Recientes
          </CardTitle>
          <Button onClick={onCreateNomina} className="bg-amber-500 hover:bg-amber-600">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Nómina
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {misNominas.slice(0, 5).map(nomina => (
              <div 
                key={nomina.id} 
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    nomina.estado === 'pagada' ? 'bg-emerald-100' :
                    nomina.estado === 'autorizada' ? 'bg-purple-100' :
                    nomina.estado === 'validada' ? 'bg-blue-100' :
                    'bg-amber-100'
                  }`}>
                    <DollarSign className={`w-5 h-5 ${
                      nomina.estado === 'pagada' ? 'text-emerald-600' :
                      nomina.estado === 'autorizada' ? 'text-purple-600' :
                      nomina.estado === 'validada' ? 'text-blue-600' :
                      'text-amber-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Semana del {new Date(nomina.semanaDel).toLocaleDateString('es-MX')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {nomina.obraName} • {nomina.empleados.length} empleados
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(nomina.totalNomina)}</p>
                    <Badge variant="outline" className={
                      nomina.estado === 'pagada' ? 'text-emerald-600 border-emerald-200' :
                      nomina.estado === 'autorizada' ? 'text-purple-600 border-purple-200' :
                      nomina.estado === 'validada' ? 'text-blue-600 border-blue-200' :
                      'text-amber-600 border-amber-200'
                    }>
                      {nomina.estado}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {misNominas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No has creado ninguna nómina</p>
                <Button onClick={onCreateNomina} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear primera nómina
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

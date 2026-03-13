import { useEffect, useState } from 'react';
import { 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  TrendingUp,
  ArrowRight,
  Calendar,
  HardHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Obra, Nomina, User } from '@/types';

interface ResidenteDashboardProps {
  user: User;
  obras: Obra[];
  nominas: Nomina[];
  onViewObra: (obraId: string) => void;
  onCreateNomina?: () => void;
}

interface AlertaAccion {
  id: string;
  obraId: string;
  obraName: string;
  tipo: 'cierre' | 'nomina' | 'avance' | 'caja' | 'documento';
  mensaje: string;
  severidad: 'alta' | 'media' | 'baja';
  accionLabel: string;
}

export function ResidenteDashboard({ 
  user, 
  obras, 
  nominas, 
  onViewObra 
}: ResidenteDashboardProps) {
  
  const [alertas, setAlertas] = useState<AlertaAccion[]>([]);
  
  // Filtrar obras del residente
  const misObras = obras.filter(o => o.residenteId === user.id && o.estado === 'activa');
  
  useEffect(() => {
    const nuevasAlertas: AlertaAccion[] = [];
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0=Dom, 5=Viernes, 6=Sab
    
    misObras.forEach(obra => {
      // 1. Alerta de Cierre de Semana (Viernes o Sábado si no cerró)
      if (diaSemana === 5 || diaSemana === 6) {
        // Verificar si ya existe nómina para esta semana
        const semanaActual = obra.semanaActualReporte || 0;
        const nominaExistente = nominas.some(n => 
          n.obraId === obra.id && n.numeroSemana === semanaActual + 1
        );
        
        if (!nominaExistente) {
          nuevasAlertas.push({
            id: `cierre-${obra.id}`,
            obraId: obra.id,
            obraName: obra.nombre,
            tipo: 'cierre',
            mensaje: '¡Es viernes! Debes cerrar la semana y generar la nómina',
            severidad: 'alta',
            accionLabel: 'Cerrar Semana Ahora'
          });
        }
      }
      
      // 2. Alerta de Avance Físico (Si lleva más de 7 días sin reportar)
      const ultimoAvance = obra.registrosAvance?.[obra.registrosAvance.length - 1];
      if (ultimoAvance) {
        const fechaUltimo = new Date(ultimoAvance.fechaReporte || obra.fechaInicio);
        const diasDiff = Math.floor((hoy.getTime() - fechaUltimo.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasDiff > 7) {
          nuevasAlertas.push({
            id: `avance-${obra.id}`,
            obraId: obra.id,
            obraName: obra.nombre,
            tipo: 'avance',
            mensaje: `Llevas ${diasDiff} días sin reportar avance físico`,
            severidad: 'media',
            accionLabel: 'Reportar Avance'
          });
        }
      }
      
      // 3. Alerta de Caja Chica (Si no hay registro de esta semana)
      // (Aquí conectarías con tu hook de caja chica)
      
      // 4. Obra sin presupuesto
      if (!obra.presupuesto?.totalPresupuesto) {
        nuevasAlertas.push({
          id: `presupuesto-${obra.id}`,
          obraId: obra.id,
          obraName: obra.nombre,
          tipo: 'documento',
          mensaje: 'Obra sin presupuesto registrado',
          severidad: 'alta',
          accionLabel: 'Agregar Presupuesto'
        });
      }
    });
    
    setAlertas(nuevasAlertas);
  }, [misObras, nominas]);

  const getIconoAlerta = (tipo: string) => {
    switch(tipo) {
      case 'cierre': return <Clock className="w-5 h-5 text-red-600" />;
      case 'avance': return <TrendingUp className="w-5 h-5 text-orange-600" />;
      case 'caja': return <Wallet className="w-5 h-5 text-yellow-600" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getColorAlerta = (severidad: string) => {
    switch(severidad) {
      case 'alta': return 'border-l-4 border-red-500 bg-red-50';
      case 'media': return 'border-l-4 border-orange-500 bg-orange-50';
      default: return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  // Calcular estadísticas
  const obrasActivas = misObras.length;
  const avancePromedio = misObras.length > 0 
    ? misObras.reduce((acc, o) => acc + (o.avanceFisicoGlobal || 0), 0) / misObras.length 
    : 0;
  
  const nominasPendientes = nominas.filter(n => 
    misObras.some(o => o.id === n.obraId) && n.estado === 'pendiente'
  ).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header de Bienvenida */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">¡Hola, {user.name}!</h1>
        <p className="text-amber-100">Tienes {alertas.length} acciones pendientes para hoy</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mis Obras Activas</p>
                <p className="text-3xl font-bold text-gray-900">{obrasActivas}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avance Promedio</p>
                <p className="text-3xl font-bold text-gray-900">{avancePromedio.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nóminas Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">{nominasPendientes}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Día de Hoy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric' })}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna de Alertas Accionables */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Acciones Urgentes
          </h2>
          
          {alertas.length === 0 ? (
            <Card className="p-8 text-center bg-green-50 border-green-200">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-800 font-medium">¡Todo al día!</p>
              <p className="text-sm text-green-600">No tienes acciones pendientes por ahora.</p>
            </Card>
          ) : (
            alertas.map(alerta => (
              <div key={alerta.id} className={`p-4 rounded-lg shadow-sm ${getColorAlerta(alerta.severidad)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getIconoAlerta(alerta.tipo)}
                    <div>
                      <p className="font-bold text-gray-900">{alerta.obraName}</p>
                      <p className="text-sm text-gray-700 mt-1">{alerta.mensaje}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => onViewObra(alerta.obraId)}
                    className="flex-shrink-0"
                  >
                    {alerta.accionLabel}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))
          )}

          {/* Lista de Obras Rápida */}
          <h2 className="text-xl font-bold mt-8 mb-4 flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-600" />
            Acceso Rápido a Obras
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {misObras.map(obra => (
              <Card 
                key={obra.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onViewObra(obra.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{obra.nombre}</h3>
                      <p className="text-sm text-gray-500">{obra.ubicacion}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Avance Físico</span>
                      <span className="font-bold">{obra.avanceFisicoGlobal || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${obra.avanceFisicoGlobal || 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Columna Lateral - Resumen */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tu Progreso Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                    {misObras.length}
                  </div>
                  <div>
                    <p className="font-medium">Obras Activas</p>
                    <p className="text-xs text-gray-500">En tu responsabilidad</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                    {nominas.filter(n => n.estado === 'pagada' && misObras.some(o => o.id === n.obraId)).length}
                  </div>
                  <div>
                    <p className="font-medium">Nóminas Pagadas</p>
                    <p className="text-xs text-gray-500">Este mes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                    {nominas.filter(n => n.estado === 'validada' && misObras.some(o => o.id === n.obraId)).length}
                  </div>
                  <div>
                    <p className="font-medium">En Validación</p>
                    <p className="text-xs text-gray-500">Esperando contadora</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tip del día */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <p className="text-sm text-amber-800">
                <strong>💡 Tip:</strong> Recuerda subir las fotos del avance físico al cerrar la semana. Esto ayuda a la contadora a validar los pagos más rápido.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
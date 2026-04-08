// src/components/alertas/AlertasObra.tsx
import { AlertTriangle, CheckCircle, AlertOctagon, TrendingUp, DollarSign, Clock } from 'lucide-react';
import type { Obra } from '@/types';

interface AlertasObraProps {
  obra: Obra;
}

export function AlertasObra({ obra }: AlertasObraProps) {
  const avanceFisico = obra.avanceFisicoGlobal || 0;
  const avanceFinanciero = obra.avanceFinancieroGlobal || 0;
  const presupuestoTotal = obra.presupuesto?.totalPresupuesto || 0;
  const gastoReal = obra.gastoTotalReal || 0;
  
  // Si no hay datos suficientes, no mostrar alertas
  if (!presupuestoTotal || presupuestoTotal === 0) return null;
  
  // Calcular ratio de eficiencia (físico vs financiero)
  // Ratio > 1 = Vas bien (avanzas más de lo que gastas)
  // Ratio < 1 = Vas mal (gastas más de lo que avanzas)
  const ratio = avanceFinanciero > 0 ? (avanceFisico / avanceFinanciero) : 1;
  
  // Determinar estado
  let estado = {
    color: 'green',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
    titulo: 'Obra Saludable',
    mensaje: 'El avance físico va acorde al gasto financiero',
    recomendacion: 'Continúa con la gestión actual'
  };
  
  if (ratio < 0.85) {
    estado = {
      color: 'red',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertOctagon,
      titulo: '¡Alerta Crítica!',
      mensaje: `Has gastado el ${avanceFinanciero.toFixed(1)}% del presupuesto pero solo has avanzado el ${avanceFisico.toFixed(1)}% físicamente`,
      recomendacion: 'Revisa inmediatamente los gastos o reporta más avance físico'
    };
  } else if (ratio < 1.0) {
    estado = {
      color: 'yellow',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle,
      titulo: 'Atención Requerida',
      mensaje: 'Estás gastando ligeramente más rápido de lo que avanzas',
      recomendacion: 'Monitorea los gastos indirectos y optimiza recursos'
    };
  }
  
  return (
    <div className={`${estado.bg} border ${estado.border} rounded-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <estado.icon className={`w-6 h-6 ${estado.text} mt-0.5`} />
        <div className="flex-1">
          <h4 className={`font-bold ${estado.text} text-lg`}>{estado.titulo}</h4>
          <p className={`${estado.text} opacity-90 mt-1`}>{estado.mensaje}</p>
          <p className="text-sm text-gray-600 mt-2 font-medium">💡 {estado.recomendacion}</p>
          
          {/* Métricas detalladas */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-black/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Avance Físico</p>
                <p className={`font-bold ${avanceFisico >= avanceFinanciero ? 'text-green-700' : 'text-red-700'}`}>
                  {avanceFisico.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Avance Financiero</p>
                <p className="font-bold text-gray-900">{avanceFinanciero.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
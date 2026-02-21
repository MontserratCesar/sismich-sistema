import { useCallback } from 'react';
import type { DashboardStats, ObraFinanzas, Obra, Nomina } from '@/types';

export function useDashboard() {
  // CALCULAR ESTADÍSTICAS REALES DEL DASHBOARD
  const getDashboardStats = useCallback((
    obras: Obra[],
    nominas: Nomina[]
  ): DashboardStats => {
    const obrasActivas = obras.filter(o => o.estado === 'activa');
    const obrasTerminadas = obras.filter(o => o.estado === 'terminada');
    
    // Presupuesto total real (suma de todos los presupuestos)
    const totalInversion = obras.reduce((sum, o) => sum + (o.presupuestoTotal || 0), 0);
    
    // Mano de obra REAL (sumada de las obras, no estimada)
    const totalManoObra = obras.reduce((sum, o) => sum + (o.totalManoObra || 0), 0);
    
    // Materiales REALES (registrados en cada obra)
    const totalMateriales = obras.reduce((sum, o) => sum + (o.totalMateriales || 0), 0);
    
    // Ganancia/Pérdida real (presupuesto - gastos reales)
    const gananciaPerdida = totalInversion - totalManoObra - totalMateriales;
    
    const nominasPendientes = nominas.filter(n => n.estado === 'pendiente').length;
    const nominasAutorizadas = nominas.filter(n => n.estado === 'autorizada').length;

    return {
      totalObras: obras.length,
      obrasActivas: obrasActivas.length,
      obrasTerminadas: obrasTerminadas.length,
      totalInversion,
      totalManoObra,
      totalMateriales,
      gananciaPerdida,
      nominasPendientes,
      nominasAutorizadas,
    };
  }, []);

  // CALCULAR FINANZAS REALES DE UNA OBRA
  const getObraFinanzas = useCallback((
    obra: Obra,
    nominas: Nomina[]
  ): ObraFinanzas => {
    // Obtener nóminas pagadas de ESTA obra específica
    const obraNominas = nominas.filter(
      n => n.obraId === obra.id && (n.estado === 'pagada' || n.estado === 'autorizada')
    );
    
    // Mano de obra REAL (suma de nóminas)
    const manoObraTotal = obraNominas.reduce((sum, n) => sum + n.totalNomina, 0);
    
    // Materiales REALES (de la obra)
    const materialesTotal = obra.totalMateriales || 0;
    
    // Gasto total real
    const gastosTotal = manoObraTotal + materialesTotal;
    
    // Avance financiero REAL (gastos vs presupuesto)
    const avanceFinanciero = obra.presupuestoTotal > 0 
      ? (gastosTotal / obra.presupuestoTotal) * 100 
      : 0;
    
    // AVANCE FÍSICO REAL (promedio de avance de partidas)
    let avanceFisico = 0;
    if (obra.partidas && obra.partidas.length > 0) {
      const sumaAvances = obra.partidas.reduce((sum, p) => sum + (p.avancePorcentaje || 0), 0);
      avanceFisico = sumaAvances / obra.partidas.length;
    }
    
    // Desviación presupuestal real
    const desviacionPresupuestal = obra.presupuestoTotal > 0
      ? ((gastosTotal - obra.presupuestoTotal) / obra.presupuestoTotal) * 100
      : 0;
    
    // ROI (Rentabilidad)
    const roi = obra.presupuestoTotal > 0
      ? ((obra.presupuestoTotal - gastosTotal) / obra.presupuestoTotal) * 100
      : 0;

    return {
      obraId: obra.id,
      obraName: obra.nombre,
      presupuesto: obra.presupuestoTotal,
      manoObraTotal,
      materialesTotal,
      gastosTotal,
      avanceFisico: Math.round(avanceFisico * 100) / 100,
      avanceFinanciero: Math.round(avanceFinanciero * 100) / 100,
      desviacionPresupuestal: Math.round(desviacionPresupuestal * 100) / 100,
      roi: Math.round(roi * 100) / 100,
    };
  }, []);

  // DETECTAR ALERTAS FINANCIERAS REALES
  const getAlertasFinancieras = useCallback((
    obras: Obra[],
    nominas: Nomina[]
  ): { obra: Obra; tipo: 'critico' | 'advertencia' | 'info'; mensaje: string }[] => {
    const alertas: { obra: Obra; tipo: 'critico' | 'advertencia' | 'info'; mensaje: string }[] = [];

    obras.forEach(obra => {
      const finanzas = getObraFinanzas(obra, nominas);
      
      // Alerta crítica: Sobrepresupuesto mayor al 10%
      if (finanzas.desviacionPresupuestal > 10) {
        alertas.push({
          obra,
          tipo: 'critico',
          mensaje: `Sobrepresupuesto del ${finanzas.desviacionPresupuestal.toFixed(1)}%. Presupuesto: ${formatCurrency(obra.presupuestoTotal)}, Gastado: ${formatCurrency(finanzas.gastosTotal)}`,
        });
      }
      
      // Alerta: Avance financiero muy por encima del físico (desfase)
      const diferenciaAvance = finanzas.avanceFinanciero - finanzas.avanceFisico;
      if (diferenciaAvance > 25) {
        alertas.push({
          obra,
          tipo: 'advertencia',
          mensaje: `Desfase grave: Avance financiero ${finanzas.avanceFinanciero.toFixed(0)}% vs Avance físico ${finanzas.avanceFisico.toFixed(0)}%. Se ha pagado más de lo construido.`,
        });
      } else if (diferenciaAvance > 15) {
        alertas.push({
          obra,
          tipo: 'advertencia',
          mensaje: `Desfase: Avance financiero ${finanzas.avanceFinanciero.toFixed(0)}% vs Avance físico ${finanzas.avanceFisico.toFixed(0)}%`,
        });
      }
      
      // Alerta: Obra terminada sin pagar todo
      if (obra.estado === 'terminada' && finanzas.avanceFinanciero < 95) {
        alertas.push({
          obra,
          tipo: 'info',
          mensaje: `Obra terminada con ${(100 - finanzas.avanceFinanciero).toFixed(0)}% pendiente de pago`,
        });
      }
    });

    return alertas;
  }, [getObraFinanzas]);

  return {
    getDashboardStats,
    getObraFinanzas,
    getAlertasFinancieras,
  };
}

// Helper para formatear moneda
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

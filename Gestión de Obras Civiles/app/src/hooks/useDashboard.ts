import { useCallback } from 'react';
import type { DashboardStats, ObraFinanzas, Obra, Nomina } from '@/types';

export function useDashboard() {
  const getDashboardStats = useCallback((
    obras: Obra[],
    nominas: Nomina[]
  ): DashboardStats => {
    const obrasActivas = obras.filter(o => o.estado === 'activa');
    const obrasTerminadas = obras.filter(o => o.estado === 'terminada');
    
    const totalInversion = obras.reduce((sum, o) => sum + (o.presupuesto || 0), 0);
    
    const nominasPagadas = nominas.filter(n => n.estado === 'pagada');
    const totalManoObra = nominasPagadas.reduce((sum, n) => sum + n.totalNomina, 0);
    
    // Estimación de materiales (30% del presupuesto como ejemplo)
    const totalMateriales = totalInversion * 0.3;
    
    // Ganancia/pérdida estimada
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

  const getObraFinanzas = useCallback((
    obra: Obra,
    nominas: Nomina[]
  ): ObraFinanzas => {
    const obraNominas = nominas.filter(
      n => n.obraId === obra.id && (n.estado === 'pagada' || n.estado === 'autorizada')
    );
    
    const manoObraTotal = obraNominas.reduce((sum, n) => sum + n.totalNomina, 0);
    
    // Estimación de materiales (30% del presupuesto)
    const materialesTotal = obra.presupuesto * 0.3;
    
    const gastosTotal = manoObraTotal + materialesTotal;
    
    // Avance financiero (gastos vs presupuesto)
    const avanceFinanciero = obra.presupuesto > 0 
      ? (gastosTotal / obra.presupuesto) * 100 
      : 0;
    
    // Avance físico estimado (basado en tiempo transcurrido)
    const fechaInicio = new Date(obra.fechaInicio);
    const fechaTermino = new Date(obra.fechaTermino);
    const hoy = new Date();
    const totalDias = (fechaTermino.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24);
    const diasTranscurridos = (hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24);
    const avanceFisico = totalDias > 0 
      ? Math.min((diasTranscurridos / totalDias) * 100, 100) 
      : 0;
    
    // Desviación presupuestal
    const desviacionPresupuestal = obra.presupuesto > 0
      ? ((gastosTotal - obra.presupuesto) / obra.presupuesto) * 100
      : 0;
    
    // ROI estimado
    const roi = obra.presupuesto > 0
      ? ((obra.presupuesto - gastosTotal) / obra.presupuesto) * 100
      : 0;

    return {
      obraId: obra.id,
      obraName: obra.nombre,
      presupuesto: obra.presupuesto,
      manoObraTotal,
      materialesTotal,
      gastosTotal,
      avanceFisico: Math.round(avanceFisico * 100) / 100,
      avanceFinanciero: Math.round(avanceFinanciero * 100) / 100,
      desviacionPresupuestal: Math.round(desviacionPresupuestal * 100) / 100,
      roi: Math.round(roi * 100) / 100,
    };
  }, []);

  const getAlertasFinancieras = useCallback((
    obras: Obra[],
    nominas: Nomina[]
  ): { obra: Obra; tipo: 'critico' | 'advertencia' | 'info'; mensaje: string }[] => {
    const alertas: { obra: Obra; tipo: 'critico' | 'advertencia' | 'info'; mensaje: string }[] = [];

    obras.forEach(obra => {
      const finanzas = getObraFinanzas(obra, nominas);
      
      // Alerta crítica: sobrepresupuesto
      if (finanzas.desviacionPresupuestal > 20) {
        alertas.push({
          obra,
          tipo: 'critico',
          mensaje: `Sobrepresupuesto del ${finanzas.desviacionPresupuestal.toFixed(1)}%`,
        });
      } else if (finanzas.desviacionPresupuestal > 10) {
        alertas.push({
          obra,
          tipo: 'advertencia',
          mensaje: `Cerca del límite presupuestal (${finanzas.desviacionPresupuestal.toFixed(1)}%)`,
        });
      }
      
      // Alerta: avance físico vs financiero
      const diferenciaAvance = finanzas.avanceFinanciero - finanzas.avanceFisico;
      if (diferenciaAvance > 20) {
        alertas.push({
          obra,
          tipo: 'advertencia',
          mensaje: 'Gasto mayor al avance físico de la obra',
        });
      }
      
      // Alerta: ROI negativo
      if (finanzas.roi < 0) {
        alertas.push({
          obra,
          tipo: 'critico',
          mensaje: 'Proyección de pérdida',
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

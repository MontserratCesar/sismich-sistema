import { useState, useEffect, useCallback } from 'react';
import type { Obra, ConceptoPresupuesto, RegistroAvanceSemanal, TipoConcepto } from '@/types';

const OBRAS_NUEVO_KEY = 'sismich_obras_control_v1';

// Función para recalcular todo el presupuesto
const calcularPresupuesto = (conceptos: ConceptoPresupuesto[]) => {
  const conceptosCalculados = conceptos.map(c => {
    // Calcular % de avance final (ajustado o calculado)
    const porcentajeFinal = c.porcentajeAvanceAjustado !== undefined 
      ? c.porcentajeAvanceAjustado 
      : c.porcentajeAvanceCalculado;
    
    return {
      ...c,
      importe: c.cantidad * c.costoUnitario,
      porcentajeAvanceFinal: porcentajeFinal
    };
  });

  const sumaMateriales = conceptosCalculados
    .filter(c => c.tipo === 'material')
    .reduce((sum, c) => sum + c.importe, 0);

  const sumaManoObra = conceptosCalculados
    .filter(c => c.tipo === 'mano_obra')
    .reduce((sum, c) => sum + c.importe, 0);

  const sumaEquipo = conceptosCalculados
    .filter(c => c.tipo === 'equipo_herramienta')
    .reduce((sum, c) => sum + c.importe, 0);

  const costoDirecto = sumaMateriales + sumaManoObra + sumaEquipo;
  const indirectos = costoDirecto * 0.15; // 15% indirectos
  const totalPresupuesto = costoDirecto + indirectos;

  // Calcular avance físico global (promedio ponderado por importe)
  const avanceGlobal = conceptosCalculados.length > 0
    ? conceptosCalculados.reduce((sum, c) => sum + (c.porcentajeAvanceFinal * c.importe), 0) / totalPresupuesto
    : 0;

  return {
    conceptos: conceptosCalculados,
    sumaMateriales,
    sumaManoObra,
    sumaEquipoHerramienta: sumaEquipo,
    costoDirecto,
    indirectos,
    totalPresupuesto
  };
};

export function useObrasNuevo() {
  const [obras, setObras] = useState<Obra[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(OBRAS_NUEVO_KEY);
    if (stored) {
      try {
        setObras(JSON.parse(stored));
      } catch (e) {
        console.error('Error cargando obras:', e);
      }
    }
  }, []);

  const saveObras = useCallback((newObras: Obra[]) => {
    setObras(newObras);
    localStorage.setItem(OBRAS_NUEVO_KEY, JSON.stringify(newObras));
  }, []);

  // Crear obra con presupuesto detallado
  const createObra = useCallback((obraData: {
    nombre: string;
    ubicacion: string;
    ambito: string;
    fechaInicio: string;
    fechaTermino: string;
    tipoRecurso: string;
    residenteId: string;
    residenteName?: string;
    conceptos: Array<{
      num: number;
      concepto: string;
      cantidad: number;
      unidad: string;
      costoUnitario: number;
      tipo: TipoConcepto;
      metodoCalculo: 'cantidad' | 'porcentaje_directo';
    }>;
  }): Obra => {
    const now = new Date().toISOString();
    
    // Convertir conceptos iniciales al formato completo
    const conceptosCompletos: ConceptoPresupuesto[] = obraData.conceptos.map(c => ({
      ...c,
      id: `concepto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      importe: c.cantidad * c.costoUnitario,
      registrosSemanales: [],
      cantidadAcumuladaEjecutada: 0,
      porcentajeAvanceCalculado: 0,
      porcentajeAvanceFinal: 0,
      gastoReal: 0
    }));

    const presupuesto = calcularPresupuesto(conceptosCompletos);

    const newObra: Obra = {
      id: `obra-${Date.now()}`,
      nombre: obraData.nombre,
      ubicacion: obraData.ubicacion,
      ambito: obraData.ambito as any,
      fechaInicio: obraData.fechaInicio,
      fechaTermino: obraData.fechaTermino,
      tipoRecurso: obraData.tipoRecurso as any,
      residenteId: obraData.residenteId,
      residenteName: obraData.residenteName,
      estado: 'activa',
      presupuesto,
      gastoRealMateriales: 0,
      gastoRealManoObra: 0,
      gastoRealEquipo: 0,
      gastoTotalReal: 0,
      avanceFisicoGlobal: 0,
      avanceFinancieroGlobal: 0,
      semanaActualReporte: 1,
      createdAt: now,
      updatedAt: now
    };

    const updated = [...obras, newObra];
    saveObras(updated);
    return newObra;
  }, [obras, saveObras]);

  // REGISTRAR AVANCE SEMANAL (Lo más importante)
  const registrarAvanceSemanal = useCallback((
    obraId: string,
    conceptoId: string,
    data: {
      semanaDel: string;
      semanaAl: string;
      numeroSemana: number;
      cantidadEjecutada: number;
      notas?: string;
      porcentajeAjustado?: number;
      motivoAjuste?: string;
    },
    reportadoPor: string
  ): Obra | null => {
    const obra = obras.find(o => o.id === obraId);
    if (!obra) return null;

    const concepto = obra.presupuesto.conceptos.find(c => c.id === conceptoId);
    if (!concepto) return null;

    // Calcular porcentajes automáticos (REGLA DE TRES)
    const porcentajeEstaSemana = (data.cantidadEjecutada / concepto.cantidad) * 100;
    const nuevaCantidadAcumulada = concepto.cantidadAcumuladaEjecutada + data.cantidadEjecutada;
    const porcentajeAcumulado = (nuevaCantidadAcumulada / concepto.cantidad) * 100;

    const nuevoRegistro: RegistroAvanceSemanal = {
      id: `registro-${Date.now()}`,
      semanaDel: data.semanaDel,
      semanaAl: data.semanaAl,
      numeroSemana: data.numeroSemana,
      cantidadEjecutada: data.cantidadEjecutada,
      porcentajeEstaSemana: Math.min(porcentajeEstaSemana, 100),
      porcentajeAcumulado: Math.min(porcentajeAcumulado, 100),
      porcentajeAjustado: data.porcentajeAjustado,
      motivoAjuste: data.motivoAjuste,
      reportadoPor,
      fechaReporte: new Date().toISOString(),
      notas: data.notas
    };

    // Actualizar concepto
    const conceptosActualizados = obra.presupuesto.conceptos.map(c => {
      if (c.id === conceptoId) {
        const nuevoPorcentajeCalculado = Math.min(porcentajeAcumulado, 100);
        return {
          ...c,
          registrosSemanales: [...c.registrosSemanales, nuevoRegistro],
          cantidadAcumuladaEjecutada: nuevaCantidadAcumulada,
          porcentajeAvanceCalculado: nuevoPorcentajeCalculado,
          porcentajeAvanceFinal: data.porcentajeAjustado !== undefined 
            ? data.porcentajeAjustado 
            : nuevoPorcentajeCalculado
        };
      }
      return c;
    });

    // Recalcular todo el presupuesto y avances
    const nuevoPresupuesto = calcularPresupuesto(conceptosActualizados);
    
    // Calcular gasto real proporcional al avance (esto es una estimación inicial)
    const gastoProporcional = (nuevoPresupuesto.totalPresupuesto * nuevoPresupuesto.conceptos.reduce((sum, c) => sum + c.porcentajeAvanceFinal, 0) / conceptosActualizados.length) / 100;

    const updatedObra: Obra = {
      ...obra,
      presupuesto: nuevoPresupuesto,
      avanceFisicoGlobal: nuevoPresupuesto.conceptos.reduce((sum, c) => sum + c.porcentajeAvanceFinal, 0) / conceptosActualizados.length,
      avanceFinancieroGlobal: obra.presupuesto.totalPresupuesto > 0 
        ? (obra.gastoTotalReal / obra.presupuesto.totalPresupuesto) * 100 
        : 0,
      updatedAt: new Date().toISOString()
    };

    const updatedObras = obras.map(o => o.id === obraId ? updatedObra : o);
    saveObras(updatedObras);
    return updatedObra;
  }, [obras, saveObras]);

  // Actualizar gasto real (cuando se pagan nominas o materiales)
  const actualizarGastoReal = useCallback((
    obraId: string,
    tipo: 'material' | 'mano_obra' | 'equipo',
    monto: number,
    agregar: boolean = true
  ): Obra | null => {
    const obra = obras.find(o => o.id === obraId);
    if (!obra) return null;

    let nuevosGastos = { ...obra };
    const montoFinal = agregar ? monto : -monto;

    switch (tipo) {
      case 'material':
        nuevosGastos.gastoRealMateriales += montoFinal;
        break;
      case 'mano_obra':
        nuevosGastos.gastoRealManoObra += montoFinal;
        break;
      case 'equipo':
        nuevosGastos.gastoRealEquipo += montoFinal;
        break;
    }

    nuevosGastos.gastoTotalReal = nuevosGastos.gastoRealMateriales + 
                                   nuevosGastos.gastoRealManoObra + 
                                   nuevosGastos.gastoRealEquipo;

    // Recalcular avance financiero
    nuevosGastos.avanceFinancieroGlobal = obra.presupuesto.totalPresupuesto > 0
      ? (nuevosGastos.gastoTotalReal / obra.presupuesto.totalPresupuesto) * 100
      : 0;

    const updated = { ...obra, ...nuevosGastos, updatedAt: new Date().toISOString() };
    const updatedObras = obras.map(o => o.id === obraId ? updated : o);
    saveObras(updatedObras);
    return updated;
  }, [obras, saveObras]);

  // Obtener estadísticas para dashboard
  const getEstadisticasDashboard = useCallback(() => {
    const totalObras = obras.length;
    const obrasActivas = obras.filter(o => o.estado === 'activa').length;
    const obrasTerminadas = obras.filter(o => o.estado === 'terminada').length;
    
    const totalPresupuestado = obras.reduce((sum, o) => sum + o.presupuesto.totalPresupuesto, 0);
    const totalEjercido = obras.reduce((sum, o) => sum + o.gastoTotalReal, 0);
    
    const totalMaterialesPres = obras.reduce((sum, o) => sum + o.presupuesto.sumaMateriales, 0);
    const totalMaterialesReal = obras.reduce((sum, o) => sum + o.gastoRealMateriales, 0);
    
    const totalManoObraPres = obras.reduce((sum, o) => sum + o.presupuesto.sumaManoObra, 0);
    const totalManoObraReal = obras.reduce((sum, o) => sum + o.gastoRealManoObra, 0);
    
    const totalEquipoPres = obras.reduce((sum, o) => sum + o.presupuesto.sumaEquipoHerramienta, 0);
    const totalEquipoReal = obras.reduce((sum, o) => sum + o.gastoRealEquipo, 0);

    return {
      totalObras,
      obrasActivas,
      obrasTerminadas,
      totalPresupuestado,
      totalEjercido,
      totalPorEjercer: totalPresupuestado - totalEjercido,
      totalMaterialesPresupuesto: totalMaterialesPres,
      totalMaterialesEjercido: totalMaterialesReal,
      totalManoObraPresupuesto: totalManoObraPres,
      totalManoObraEjercido: totalManoObraReal,
      totalEquipoPresupuesto: totalEquipoPres,
      totalEquipoEjercido: totalEquipoReal,
      nominasPendientes: 0, // Se actualizará con hook de nominas
      nominasValidadas: 0,
      nominasAutorizadas: 0,
      nominasPagadas: 0
    };
  }, [obras]);

  const getObraById = useCallback((id: string): Obra | undefined => {
    return obras.find(o => o.id === id);
  }, [obras]);

  const deleteObra = useCallback((id: string): boolean => {
    const updated = obras.filter(o => o.id !== id);
    saveObras(updated);
    return updated.length < obras.length;
  }, [obras, saveObras]);

  return {
    obras,
    createObra,
    registrarAvanceSemanal,
    actualizarGastoReal,
    getEstadisticasDashboard,
    getObraById,
    deleteObra
  };
}

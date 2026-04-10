import { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase'; // Ajusta la ruta si es diferente
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import type { Obra, ConceptoPresupuesto, PresupuestoObra, RegistroAvanceSemanal, TipoConcepto } from '@/types';

// Función para recalcular todo el presupuesto (igual que tenías)
const calcularPresupuesto = (conceptos: ConceptoPresupuesto[]) => {
  const safeConceptos = conceptos || [];
  const conceptosCalculados = safeConceptos.map(c => {
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
    .filter(c => c.tipo === 'equipo')
    .reduce((sum, c) => sum + c.importe, 0);

  const costoDirecto = sumaMateriales + sumaManoObra + sumaEquipo;
  const indirectos = costoDirecto * 0.15; // 15% indirectos
  const totalPresupuesto = costoDirecto + indirectos;

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

export function useObras() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar obras de Firebase al iniciar
  useEffect(() => {
    const cargarObras = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "obras"));
        const obrasData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Obra[];
        
        setObras(obrasData);
        console.log("✅ Obras cargadas de Firebase:", obrasData.length);
      } catch (error) {
        console.error("❌ Error cargando obras:", error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarObras();
  }, []);

  // Crear obra — presupuesto vacío, se llena después desde el módulo de presupuesto
  const createObra = useCallback(async (obraData: {
    nombre: string;
    ubicacion: string;
    ambito: string;
    fechaInicio: string;
    fechaTermino: string;
    tipoRecurso: string;
    residenteId: string;
    residenteName?: string;
  }): Promise<Obra> => {
    try {
      const now = new Date().toISOString();

      const emptyPresupuesto: PresupuestoObra = {
        conceptos: [],
        sumaMateriales: 0,
        sumaManoObra: 0,
        costoDirecto: 0,
        indirectos: 0,
        totalPresupuesto: 0,
      };

      const newObraData = {
        nombre: obraData.nombre,
        ubicacion: obraData.ubicacion,
        ambito: obraData.ambito,
        fechaInicio: obraData.fechaInicio,
        fechaTermino: obraData.fechaTermino,
        tipoRecurso: obraData.tipoRecurso,
        residenteId: obraData.residenteId,
        residenteName: obraData.residenteName || '',
        estado: 'activa',
        presupuesto: emptyPresupuesto,
        presupuestos: {},
        estimaciones: [],
        gastoRealMateriales: 0,
        gastoRealManoObra: 0,
        gastoRealEquipo: 0,
        gastoTotalReal: 0,
        avanceFisicoGlobal: 0,
        avanceFinancieroGlobal: 0,
        semanaActualReporte: 1,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, "obras"), newObraData);

      const newObra = {
        id: docRef.id,
        ...newObraData,
      } as Obra;

      setObras(prev => [...prev, newObra]);
      console.log("✅ Obra creada en Firebase con ID:", docRef.id);
      return newObra;

    } catch (error) {
      console.error("❌ Error creando obra:", error);
      throw error;
    }
  }, []);

  // Actualizar obra existente (helper interno)
  const updateObraInFirebase = async (obraId: string, updates: Partial<Obra>) => {
    try {
      const obraRef = doc(db, "obras", obraId);
      await updateDoc(obraRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error actualizando obra:", error);
      throw error;
    }
  };

  // REGISTRAR AVANCE SEMANAL (Lo más importante)
  const registrarAvanceSemanal = useCallback(async (
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
  ): Promise<Obra | null> => {
    try {
      const obra = obras.find(o => o.id === obraId);
      if (!obra) return null;

      const concepto = (obra.presupuesto?.conceptos || []).find(c => c.id === conceptoId);
      if (!concepto) return null;

      // Calcular porcentajes automáticos (REGLA DE TRES)
      const porcentajeEstaSemana = (data.cantidadEjecutada / concepto.cantidad) * 100;
      const nuevaCantidadAcumulada = concepto.cantidadAcumuladaEjecutada + data.cantidadEjecutada;
      const porcentajeAcumulado = (nuevaCantidadAcumulada / concepto.cantidad) * 100;

      const nuevoRegistro: RegistroAvanceSemanal = {
        id: `registro-${Date.now()}`,
        semana: parseInt(data.semanaDel) || 1,
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

      // Actualizar conceptos
      const conceptosActualizados = (obra.presupuesto?.conceptos || []).map(c => {
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
      
      const updatedObra: Obra = {
        ...obra,
        presupuesto: nuevoPresupuesto,
        avanceFisicoGlobal: nuevoPresupuesto.conceptos.reduce((sum, c) => sum + c.porcentajeAvanceFinal, 0) / conceptosActualizados.length,
        avanceFinancieroGlobal: obra.presupuesto.totalPresupuesto > 0 
          ? (obra.gastoTotalReal / obra.presupuesto.totalPresupuesto) * 100 
          : 0,
        updatedAt: new Date().toISOString()
      };

      // Guardar en Firebase
      await updateObraInFirebase(obraId, {
        presupuesto: updatedObra.presupuesto,
        avanceFisicoGlobal: updatedObra.avanceFisicoGlobal,
        avanceFinancieroGlobal: updatedObra.avanceFinancieroGlobal,
        updatedAt: updatedObra.updatedAt
      });

      // Actualizar estado local
      const updatedObras = obras.map(o => o.id === obraId ? updatedObra : o);
      setObras(updatedObras);
      
      console.log("✅ Avance registrado en Firebase");
      return updatedObra;
      
    } catch (error) {
      console.error("❌ Error registrando avance:", error);
      return null;
    }
  }, [obras]);

  // Actualizar gasto real
  const actualizarGastoReal = useCallback(async (
    obraId: string,
    tipo: 'material' | 'mano_obra' | 'equipo',
    monto: number,
    agregar: boolean = true
  ): Promise<Obra | null> => {
    try {
      const obra = obras.find(o => o.id === obraId);
      if (!obra) return null;

      const montoFinal = agregar ? monto : -monto;
      let updates: Partial<Obra> = {};

      switch (tipo) {
        case 'material':
          updates.gastoRealMateriales = obra.gastoRealMateriales + montoFinal;
          break;
        case 'mano_obra':
          updates.gastoRealManoObra = obra.gastoRealManoObra + montoFinal;
          break;
        case 'equipo':
          updates.gastoRealEquipo = obra.gastoRealEquipo + montoFinal;
          break;
      }

      updates.gastoTotalReal = (updates.gastoRealMateriales || obra.gastoRealMateriales) + 
                               (updates.gastoRealManoObra || obra.gastoRealManoObra) + 
                               (updates.gastoRealEquipo || obra.gastoRealEquipo);

      updates.avanceFinancieroGlobal = obra.presupuesto.totalPresupuesto > 0
        ? (updates.gastoTotalReal / obra.presupuesto.totalPresupuesto) * 100
        : 0;

      await updateObraInFirebase(obraId, updates);

      const updated = { ...obra, ...updates, updatedAt: new Date().toISOString() };
      const updatedObras = obras.map(o => o.id === obraId ? updated : o);
      setObras(updatedObras);
      
      return updated;
      
    } catch (error) {
      console.error("Error actualizando gasto:", error);
      return null;
    }
  }, [obras]);

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
    
    const totalEquipoPres = obras.reduce((sum, o) => sum + (o.presupuesto?.sumaEquipoHerramienta || 0), 0);
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
      nominasPendientes: 0,
      nominasValidadas: 0,
      nominasAutorizadas: 0,
      nominasPagadas: 0
    };
  }, [obras]);

  const getObraById = useCallback((id: string): Obra | undefined => {
    return obras.find(o => o.id === id);
  }, [obras]);

  const deleteObra = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "obras", id));
      const updated = obras.filter(o => o.id !== id);
      setObras(updated);
      console.log("✅ Obra eliminada de Firebase");
      return true;
    } catch (error) {
      console.error("Error eliminando obra:", error);
      return false;
    }
  }, [obras]);

  const updateObra = useCallback(async (obraId: string, updates: Partial<Obra>): Promise<void> => {
  try {
    const obraRef = doc(db, "obras", obraId);
    await updateDoc(obraRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    setObras(prev => prev.map(o => o.id === obraId ? { ...o, ...updates } : o));
    console.log("✅ Obra actualizada en Firebase");
  } catch (error) {
    console.error("❌ Error actualizando obra:", error);
    throw error;
  }
}, []);

  return {
    obras,
    loading, // Nuevo: para saber si está cargando
    createObra,
    updateObra,
    registrarAvanceSemanal,
    actualizarGastoReal,
    getEstadisticasDashboard,
    getObraById,
    deleteObra
  };
}
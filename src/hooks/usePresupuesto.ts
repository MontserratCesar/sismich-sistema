import { useState, useCallback } from 'react';
import { db } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { VersionPresupuesto, TipoPresupuesto, Estimacion, ConceptoVersion } from '@/types';

export const IVA = 0.16;

export function calcularTotalesVersion(conceptos: ConceptoVersion[]) {
  const subtotal = (conceptos || []).reduce((sum, c) => sum + (c.importe || 0), 0);
  const iva = subtotal * IVA;
  const total = subtotal + iva;
  return { subtotal, iva, total };
}

export function usePresupuesto() {
  const [saving, setSaving] = useState(false);

  /**
   * Persiste una versión de presupuesto (presentado/contrato/ejecutado)
   * en el campo `presupuestos.{tipo}` del documento de la obra en Firestore.
   */
  const saveVersion = useCallback(async (
    obraId: string,
    version: VersionPresupuesto
  ): Promise<void> => {
    setSaving(true);
    try {
      const obraRef = doc(db, 'obras', obraId);
      await updateDoc(obraRef, {
        [`presupuestos.${version.tipo}`]: {
          ...version,
          updatedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error guardando versión de presupuesto:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  /**
   * Agrega o actualiza una estimación en el array `estimaciones` de la obra.
   * Requiere el array actual para no perder estimaciones anteriores.
   */
  const saveEstimacion = useCallback(async (
    obraId: string,
    estimacion: Estimacion,
    estimacionesActuales: Estimacion[] = []
  ): Promise<void> => {
    setSaving(true);
    try {
      const obraRef = doc(db, 'obras', obraId);
      const existeIdx = estimacionesActuales.findIndex(e => e.id === estimacion.id);
      const nuevas = existeIdx >= 0
        ? estimacionesActuales.map(e => e.id === estimacion.id ? estimacion : e)
        : [...estimacionesActuales, estimacion];

      await updateDoc(obraRef, {
        estimaciones: nuevas,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error guardando estimación:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  return { saving, saveVersion, saveEstimacion };
}

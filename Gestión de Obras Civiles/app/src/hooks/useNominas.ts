import { useState, useEffect, useCallback } from 'react';
import type { Nomina, NominaEmpleado, EstadoNomina } from '@/types';

const NOMINAS_KEY = 'sismich_nominas';

export function useNominas() {
  const [nominas, setNominas] = useState<Nomina[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(NOMINAS_KEY);
    if (stored) {
      setNominas(JSON.parse(stored));
    }
  }, []);

  const saveNominas = useCallback((newNominas: Nomina[]) => {
    setNominas(newNominas);
    localStorage.setItem(NOMINAS_KEY, JSON.stringify(newNominas));
  }, []);

  const createNomina = useCallback((nominaData: Omit<Nomina, 'id' | 'createdAt' | 'updatedAt' | 'totalNomina'>): Nomina => {
    const totalNomina = nominaData.empleados.reduce((sum, emp) => sum + emp.totalSemana, 0);
    const now = new Date().toISOString();
    const newNomina: Nomina = {
      ...nominaData,
      totalNomina,
      id: `nomina-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...nominas, newNomina];
    saveNominas(updated);
    return newNomina;
  }, [nominas, saveNominas]);

  const updateNomina = useCallback((id: string, updates: Partial<Nomina>): Nomina | null => {
    const updated = nominas.map(n => {
      if (n.id === id) {
        const updatedNomina = { ...n, ...updates, updatedAt: new Date().toISOString() };
        // Recalcular total si cambiaron empleados
        if (updates.empleados) {
          updatedNomina.totalNomina = updates.empleados.reduce((sum, emp) => sum + emp.totalSemana, 0);
        }
        return updatedNomina;
      }
      return n;
    });
    saveNominas(updated);
    return updated.find(n => n.id === id) || null;
  }, [nominas, saveNominas]);

  const deleteNomina = useCallback((id: string): boolean => {
    const updated = nominas.filter(n => n.id !== id);
    saveNominas(updated);
    return updated.length < nominas.length;
  }, [nominas, saveNominas]);

  const getNominaById = useCallback((id: string): Nomina | undefined => {
    return nominas.find(n => n.id === id);
  }, [nominas]);

  const getNominasByObra = useCallback((obraId: string): Nomina[] => {
    return nominas.filter(n => n.obraId === obraId);
  }, [nominas]);

  const getNominasByResidente = useCallback((residenteId: string): Nomina[] => {
    return nominas.filter(n => n.residenteId === residenteId);
  }, [nominas]);

  const getNominasByEstado = useCallback((estado: EstadoNomina): Nomina[] => {
    return nominas.filter(n => n.estado === estado);
  }, [nominas]);

  const validarNomina = useCallback((id: string): Nomina | null => {
    return updateNomina(id, { 
      estado: 'validada', 
      validadaAt: new Date().toISOString() 
    });
  }, [updateNomina]);

  const autorizarNomina = useCallback((id: string): Nomina | null => {
    return updateNomina(id, { 
      estado: 'autorizada', 
      autorizadaAt: new Date().toISOString() 
    });
  }, [updateNomina]);

  const pagarNomina = useCallback((id: string): Nomina | null => {
    return updateNomina(id, { 
      estado: 'pagada', 
      pagadaAt: new Date().toISOString() 
    });
  }, [updateNomina]);

  const calcularTotalNomina = useCallback((empleados: NominaEmpleado[]): number => {
    return empleados.reduce((sum, emp) => sum + emp.totalSemana, 0);
  }, []);

  const getManoObraByObra = useCallback((obraId: string): number => {
    return nominas
      .filter(n => n.obraId === obraId && (n.estado === 'pagada' || n.estado === 'autorizada'))
      .reduce((sum, n) => sum + n.totalNomina, 0);
  }, [nominas]);

  return {
    nominas,
    createNomina,
    updateNomina,
    deleteNomina,
    getNominaById,
    getNominasByObra,
    getNominasByResidente,
    getNominasByEstado,
    validarNomina,
    autorizarNomina,
    pagarNomina,
    calcularTotalNomina,
    getManoObraByObra,
  };
}

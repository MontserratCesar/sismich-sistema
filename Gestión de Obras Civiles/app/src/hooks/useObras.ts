import { useState, useEffect, useCallback } from 'react';
import type { Obra, EstadoObra } from '@/types';

const OBRAS_KEY = 'sismich_obras';

export function useObras() {
  const [obras, setObras] = useState<Obra[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(OBRAS_KEY);
    if (stored) {
      setObras(JSON.parse(stored));
    }
  }, []);

  const saveObras = useCallback((newObras: Obra[]) => {
    setObras(newObras);
    localStorage.setItem(OBRAS_KEY, JSON.stringify(newObras));
  }, []);

  const createObra = useCallback((obraData: Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>): Obra => {
    const now = new Date().toISOString();
    const newObra: Obra = {
      ...obraData,
      id: `obra-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...obras, newObra];
    saveObras(updated);
    return newObra;
  }, [obras, saveObras]);

  const updateObra = useCallback((id: string, updates: Partial<Obra>): Obra | null => {
    const updated = obras.map(o => 
      o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
    );
    saveObras(updated);
    return updated.find(o => o.id === id) || null;
  }, [obras, saveObras]);

  const deleteObra = useCallback((id: string): boolean => {
    const updated = obras.filter(o => o.id !== id);
    saveObras(updated);
    return updated.length < obras.length;
  }, [obras, saveObras]);

  const getObraById = useCallback((id: string): Obra | undefined => {
    return obras.find(o => o.id === id);
  }, [obras]);

  const getObrasByResidente = useCallback((residenteId: string): Obra[] => {
    return obras.filter(o => o.residenteId === residenteId);
  }, [obras]);

  const getObrasActivas = useCallback((): Obra[] => {
    return obras.filter(o => o.estado === 'activa');
  }, [obras]);

  const getObrasByEstado = useCallback((estado: EstadoObra): Obra[] => {
    return obras.filter(o => o.estado === estado);
  }, [obras]);

  const terminarObra = useCallback((id: string): Obra | null => {
    return updateObra(id, { estado: 'terminada', fechaTermino: new Date().toISOString().split('T')[0] });
  }, [updateObra]);

  const actualizarManoObra = useCallback((obraId: string, montoTotalNominas: number) => {
  updateObra(obraId, { 
    totalManoObra: montoTotalNominas,
    // Recalcular avance financiero automáticamente
  });
}, [updateObra]);

  return {
    obras,
    createObra,
    updateObra,
    deleteObra,
    getObraById,
    getObrasByResidente,
    getObrasActivas,
    getObrasByEstado,
    terminarObra,
    actualizarManoObra,
  };
}

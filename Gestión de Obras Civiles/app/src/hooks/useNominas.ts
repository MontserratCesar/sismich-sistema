import { useState, useEffect, useCallback } from 'react';
import type { Nomina, NominaEmpleado } from '@/types';

const NOMINAS_KEY = 'sismich_nominas_v2';

export function useNominas() {
  const [nominas, setNominas] = useState<Nomina[]>([]);

  // Cargar al iniciar
  useEffect(() => {
    const stored = localStorage.getItem(NOMINAS_KEY);
    if (stored) {
      try {
        setNominas(JSON.parse(stored));
      } catch (e) {
        console.error('Error cargando nominas:', e);
      }
    }
  }, []);

  // Guardar cambios
  const saveNominas = useCallback((newNominas: Nomina[]) => {
    setNominas(newNominas);
    localStorage.setItem(NOMINAS_KEY, JSON.stringify(newNominas));
  }, []);

  // Calcular total de un empleado
  const calcularTotalEmpleado = (emp: NominaEmpleado): number => {
    const diasTrabajados = Object.values(emp.dias).reduce((sum, dia) => sum + (dia || 0), 0);
    return diasTrabajados * emp.salarioDiario;
  };

  // Crear nueva nómina
  const createNomina = useCallback((nominaData: Omit<Nomina, 'id' | 'createdAt' | 'updatedAt' | 'totalNomina' | 'estado'>): Nomina => {
    const now = new Date().toISOString();
    
    // Calcular totales automáticamente
    const empleadosCalculados = nominaData.empleados.map(emp => ({
      ...emp,
      totalDias: Object.values(emp.dias).reduce((sum, dia) => sum + (dia || 0), 0),
      totalSemana: calcularTotalEmpleado(emp)
    }));

    const totalNomina = empleadosCalculados.reduce((sum, emp) => sum + emp.totalSemana, 0);

    const newNomina: Nomina = {
      ...nominaData,
      id: `nomina-${Date.now()}`,
      empleados: empleadosCalculados,
      totalNomina,
      estado: 'pendiente',
      createdAt: now,
      updatedAt: now
    };

    const updated = [...nominas, newNomina];
    saveNominas(updated);
    return newNomina;
  }, [nominas, saveNominas]);

  // Actualizar nómina (para cambiar días, salarios, etc.)
  const updateNomina = useCallback((id: string, updates: Partial<Nomina>): Nomina | null => {
    const nomina = nominas.find(n => n.id === id);
    if (!nomina) return null;

    // Si cambiaron empleados, recalcular todo
    let updatedEmpleados = nomina.empleados;
    let newTotal = nomina.totalNomina;

    if (updates.empleados) {
      updatedEmpleados = updates.empleados.map(emp => {
        const totalDias = Object.values(emp.dias).reduce((sum, dia) => sum + (dia || 0), 0);
        const totalSemana = totalDias * emp.salarioDiario;
        return { ...emp, totalDias, totalSemana };
      });
      newTotal = updatedEmpleados.reduce((sum, emp) => sum + emp.totalSemana, 0);
    }

    const updated: Nomina = {
      ...nomina,
      ...updates,
      empleados: updatedEmpleados,
      totalNomina: newTotal,
      updatedAt: new Date().toISOString()
    };

    const updatedList = nominas.map(n => n.id === id ? updated : n);
    saveNominas(updatedList);
    return updated;
  }, [nominas, saveNominas]);

  // Cambiar estado (Validar → Autorizar → Pagar)
  const cambiarEstado = useCallback((id: string, nuevoEstado: Nomina['estado'], usuario: string): Nomina | null => {
    const now = new Date().toISOString();
    const updates: Partial<Nomina> = { estado: nuevoEstado };

    switch (nuevoEstado) {
      case 'validada':
        updates.validadaAt = now;
        break;
      case 'autorizada':
        updates.autorizadaAt = now;
        updates.autorizo = usuario;
        break;
      case 'pagada':
        updates.pagadaAt = now;
        break;
    }

    return updateNomina(id, updates);
  }, [updateNomina]);

  // Eliminar nómina
  const deleteNomina = useCallback((id: string): boolean => {
    const updated = nominas.filter(n => n.id !== id);
    saveNominas(updated);
    return updated.length < nominas.length;
  }, [nominas, saveNominas]);

  // Obtener nóminas por obra
  const getNominasByObra = useCallback((obraId: string): Nomina[] => {
    return nominas.filter(n => n.obraId === obraId).sort((a, b) => 
      new Date(b.semanaDel).getTime() - new Date(a.semanaDel).getTime()
    );
  }, [nominas]);

  // Obtener total pagado por obra (para actualizar la obra automáticamente)
  const getTotalPagadoByObra = useCallback((obraId: string): number => {
    return nominas
      .filter(n => n.obraId === obraId && n.estado === 'pagada')
      .reduce((sum, n) => sum + n.totalNomina, 0);
  }, [nominas]);

  return {
    nominas,
    createNomina,
    updateNomina,
    deleteNomina,
    cambiarEstado,
    getNominasByObra,
    getTotalPagadoByObra
  };
}

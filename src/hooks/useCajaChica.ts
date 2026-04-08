import { useState, useEffect, useCallback } from 'react';
import type { CajaChica, GastoCajaChica } from '@/types';

const CAJA_CHICA_KEY = 'sismich_caja_chica_v1';

export function useCajaChica() {
  const [cajas, setCajas] = useState<CajaChica[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CAJA_CHICA_KEY);
    if (stored) {
      try {
        setCajas(JSON.parse(stored));
      } catch (e) {
        console.error('Error cargando caja chica:', e);
      }
    }
  }, []);

  const saveCajas = useCallback((newCajas: CajaChica[]) => {
    setCajas(newCajas);
    localStorage.setItem(CAJA_CHICA_KEY, JSON.stringify(newCajas));
  }, []);

  const createCajaChica = useCallback((data: {
    obraId: string;
    semanaDel: string;
    semanaAl: string;
    saldoAnterior: number;
    importeEntregado: number;
    gastos: Omit<GastoCajaChica, 'id'>[];
    elaboradoPor: string;
  }): CajaChica => {
    const now = new Date().toISOString();
    
    // Calcular totales automáticamente
    const gastosConId: GastoCajaChica[] = data.gastos.map((g, index) => ({
      ...g,
      id: `gasto-${Date.now()}-${index}`,
      importe: g.cantidad * g.precioUnitario
    }));

    const totalComprobado = gastosConId.reduce((sum, g) => sum + g.importe, 0);
    const saldoEnCaja = data.saldoAnterior + data.importeEntregado - totalComprobado;

    const newCaja: CajaChica = {
      id: `caja-${Date.now()}`,
      obraId: data.obraId,
      semanaDel: data.semanaDel,
      semanaAl: data.semanaAl,
      saldoAnterior: data.saldoAnterior,
      importeEntregado: data.importeEntregado,
      totalComprobado,
      gastos: gastosConId,
      saldoEnCaja,
      fechaElaboracion: now.split('T')[0],
      createdAt: now
    };

    const updated = [...cajas, newCaja];
    saveCajas(updated);
    return newCaja;
  }, [cajas, saveCajas]);

  const getCajasByObra = useCallback((obraId: string): CajaChica[] => {
    return cajas.filter(c => c.obraId === obraId).sort((a, b) => 
      new Date(b.semanaDel).getTime() - new Date(a.semanaDel).getTime()
    );
  }, [cajas]);

  const getTotalGastosIndirectosByObra = useCallback((obraId: string): number => {
    return cajas
      .filter(c => c.obraId === obraId)
      .reduce((sum, c) => sum + c.totalComprobado, 0);
  }, [cajas]);

  return {
    cajas,
    createCajaChica,
    getCajasByObra,
    getTotalGastosIndirectosByObra
  };
}

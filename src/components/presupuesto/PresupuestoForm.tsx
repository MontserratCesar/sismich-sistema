import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Trash2, Save, X, FileText } from 'lucide-react';
import type { TipoPresupuesto, VersionPresupuesto, ConceptoVersion } from '@/types';
import { buscarEnCatalogo, type ItemCatalogo } from '@/utils/catalogo';
import { calcularTotalesVersion } from '@/hooks/usePresupuesto';

interface PresupuestoFormProps {
  obraId: string;
  obraName: string;
  presupuestosExistentes?: {
    presentado?: VersionPresupuesto;
    contrato?: VersionPresupuesto;
    ejecutado?: VersionPresupuesto;
  };
  onSave: (tipo: TipoPresupuesto, version: VersionPresupuesto) => void;
  onCancel: () => void;
}

const TIPOS: { value: TipoPresupuesto; label: string; activeClass: string }[] = [
  { value: 'presentado', label: 'Presentado', activeClass: 'bg-blue-600 text-white' },
  { value: 'contrato',   label: 'Contrato',   activeClass: 'bg-green-600 text-white' },
  { value: 'ejecutado',  label: 'Ejecutado',  activeClass: 'bg-orange-600 text-white' },
];

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

export function PresupuestoForm({
  obraId,
  obraName,
  presupuestosExistentes,
  onSave,
  onCancel,
}: PresupuestoFormProps) {
  const [tipoActivo, setTipoActivo] = useState<TipoPresupuesto>('presentado');

  // Un estado de conceptos independiente por versión
  const [conceptosPorTipo, setConceptosPorTipo] = useState<Record<TipoPresupuesto, ConceptoVersion[]>>({
    presentado: presupuestosExistentes?.presentado?.conceptos || [],
    contrato:   presupuestosExistentes?.contrato?.conceptos   || [],
    ejecutado:  presupuestosExistentes?.ejecutado?.conceptos  || [],
  });

  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<ItemCatalogo[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Buscar en catálogo mientras el usuario escribe
  useEffect(() => {
    if (busqueda.length >= 2) {
      setResultados(buscarEnCatalogo(busqueda));
      setShowDropdown(true);
    } else {
      setResultados([]);
      setShowDropdown(false);
    }
  }, [busqueda]);

  const conceptosActivos = conceptosPorTipo[tipoActivo];

  const setConceptosActivos = (conceptos: ConceptoVersion[]) =>
    setConceptosPorTipo(prev => ({ ...prev, [tipoActivo]: conceptos }));

  // ── Acciones sobre la tabla ───────────────────────────────────────────────

  const agregarDesdeCatalogo = (item: ItemCatalogo) => {
    const nuevo: ConceptoVersion = {
      id: `${item.clave}-${Date.now()}`,
      clave: item.clave,
      partida: item.partida,
      concepto: item.concepto,
      unidad: item.unidad,
      precioUnitario: item.precioUnitario,
      cantidad: 1,
      importe: item.precioUnitario,
    };
    setConceptosActivos([...conceptosActivos, nuevo]);
    setBusqueda('');
    setShowDropdown(false);
  };

  const agregarFilaManual = () => {
    const nueva: ConceptoVersion = {
      id: `manual-${Date.now()}`,
      clave: '',
      partida: '',
      concepto: '',
      unidad: '',
      precioUnitario: 0,
      cantidad: 0,
      importe: 0,
    };
    setConceptosActivos([...conceptosActivos, nueva]);
  };

  const eliminarFila = (id: string) =>
    setConceptosActivos(conceptosActivos.filter(c => c.id !== id));

  const actualizarFila = (id: string, field: keyof ConceptoVersion, value: string | number) => {
    setConceptosActivos(
      conceptosActivos.map(c => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        if (field === 'cantidad' || field === 'precioUnitario') {
          const cant = field === 'cantidad' ? Number(value) : c.cantidad;
          const pu   = field === 'precioUnitario' ? Number(value) : c.precioUnitario;
          updated.importe = cant * pu;
        }
        return updated;
      })
    );
  };

  // ── Totales ───────────────────────────────────────────────────────────────

  const { subtotal, iva, total } = calcularTotalesVersion(conceptosActivos);

  // ── Guardar ───────────────────────────────────────────────────────────────

  const handleSave = () => {
    const version: VersionPresupuesto = {
      tipo: tipoActivo,
      conceptos: conceptosActivos.filter(c => c.concepto.trim() !== ''),
      subtotal,
      iva,
      total,
      updatedAt: new Date().toISOString(),
    };
    onSave(tipoActivo, version);
  };

  const conceptosSinVacios = conceptosActivos.filter(c => c.concepto.trim());

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-5 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Presupuesto de Obra
            </h2>
            <p className="text-blue-200 text-sm mt-1">{obraName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-300 uppercase tracking-wide">
              Total — {TIPOS.find(t => t.value === tipoActivo)?.label}
            </p>
            <p className="text-3xl font-bold">{fmt(total)}</p>
          </div>
        </div>
      </div>

      {/* Tabs de versión */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
        {TIPOS.map(tipo => {
          const count = (conceptosPorTipo[tipo.value] || []).filter(c => c.concepto.trim()).length;
          const isActive = tipoActivo === tipo.value;
          return (
            <button
              key={tipo.value}
              onClick={() => setTipoActivo(tipo.value)}
              className={`flex-1 py-2 px-3 rounded-md font-semibold text-sm transition-all flex items-center justify-center gap-2
                ${isActive ? tipo.activeClass + ' shadow-sm' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`}
            >
              {tipo.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                  ${isActive ? 'bg-white/25' : 'bg-gray-300 text-gray-700'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Buscador del catálogo */}
      <div className="relative" ref={searchRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por clave (ej. 11000) o palabra clave del concepto..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={agregarFilaManual}>
            <Plus className="w-4 h-4 mr-1" />
            Fila manual
          </Button>
        </div>

        {/* Dropdown resultados */}
        {showDropdown && resultados.length > 0 && (
          <div className="absolute top-full left-0 right-16 z-50 bg-white border border-gray-200 rounded-lg shadow-2xl mt-1 max-h-72 overflow-y-auto">
            {resultados.map(item => (
              <button
                key={`${item.clave}-${item.concepto.slice(0, 10)}`}
                onClick={() => agregarDesdeCatalogo(item)}
                className="w-full px-4 py-3 hover:bg-blue-50 text-left border-b last:border-0 flex justify-between items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded font-bold text-gray-700">
                      {item.clave}
                    </span>
                    <span className="text-xs text-gray-400 truncate">{item.partida}</span>
                  </div>
                  <p className="text-xs text-gray-800 line-clamp-2 leading-snug">{item.concepto}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{item.unidad}</p>
                  <p className="text-sm font-bold text-green-700">{fmt(item.precioUnitario)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && busqueda.length >= 2 && resultados.length === 0 && (
          <div className="absolute top-full left-0 right-16 z-50 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 p-4 text-sm text-gray-500 text-center">
            Sin resultados para "{busqueda}"
          </div>
        )}
      </div>

      {/* Tabla de conceptos */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 w-24">Clave</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Concepto</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 w-20">Unidad</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 w-32">P.U. ($)</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 w-24">Cantidad</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 w-32">Importe</th>
                <th className="w-9"></th>
              </tr>
            </thead>
            <tbody>
              {conceptosActivos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Busca conceptos en el catálogo o agrega filas manualmente</p>
                  </td>
                </tr>
              ) : (
                conceptosActivos.map(c => (
                  <tr key={c.id} className="border-t hover:bg-gray-50/50">
                    <td className="px-2 py-1">
                      <Input
                        value={c.clave}
                        onChange={e => actualizarFila(c.id, 'clave', e.target.value)}
                        className="h-7 text-xs font-mono border-transparent focus:border-gray-300 bg-transparent px-2"
                        placeholder="Clave"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        value={c.concepto}
                        onChange={e => actualizarFila(c.id, 'concepto', e.target.value)}
                        className="h-7 text-xs border-transparent focus:border-gray-300 bg-transparent px-2"
                        placeholder="Descripción..."
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        value={c.unidad}
                        onChange={e => actualizarFila(c.id, 'unidad', e.target.value)}
                        className="h-7 text-xs text-center border-transparent focus:border-gray-300 bg-transparent px-1"
                        placeholder="m2"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        type="number"
                        value={c.precioUnitario || ''}
                        onChange={e => actualizarFila(c.id, 'precioUnitario', parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs text-right border-transparent focus:border-gray-300 bg-transparent px-2"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <Input
                        type="number"
                        value={c.cantidad || ''}
                        onChange={e => actualizarFila(c.id, 'cantidad', parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs text-right border-transparent focus:border-gray-300 bg-transparent px-2"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-semibold text-gray-800 whitespace-nowrap">
                      {fmt(c.importe)}
                    </td>
                    <td className="px-1 py-1 text-center">
                      <button
                        onClick={() => eliminarFila(c.id)}
                        className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de totales */}
      <div className="bg-gray-900 text-white rounded-lg p-4">
        <div className="flex justify-end">
          <div className="space-y-1.5 text-sm min-w-64">
            <div className="flex justify-between gap-12">
              <span className="text-gray-400">Subtotal:</span>
              <span className="font-mono">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-12">
              <span className="text-gray-400">IVA (16%):</span>
              <span className="font-mono">{fmt(iva)}</span>
            </div>
            <div className="flex justify-between gap-12 pt-2 border-t border-gray-700 text-base font-bold">
              <span>TOTAL:</span>
              <span className="font-mono text-green-400">{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-1 border-t">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={conceptosSinVacios.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar {TIPOS.find(t => t.value === tipoActivo)?.label}
        </Button>
      </div>
    </div>
  );
}

// SISTEMA SISMICH - CONTROL DE OBRA CIVIL PROFESIONAL

export type UserRole = 'admin' | 'residente' | 'contadora';
export type TipoConcepto = 'material' | 'mano_obra' | 'equipo_herramienta';
export type EstadoObra = 'activa' | 'terminada' | 'cancelada';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  isActive: boolean;
}

// REGISTRO SEMANAL DE AVANCE (Historial por semana)
export interface RegistroAvanceSemanal {
  id: string;
  semanaDel: string; // Fecha inicio (YYYY-MM-DD)
  semanaAl: string; // Fecha fin (YYYY-MM-DD)
  numeroSemana: number;
  cantidadEjecutada: number; // Lo que realmente se hizo esta semana
  porcentajeEstaSemana: number; // % correspondiente a esta cantidad
  porcentajeAcumulado: number; // % acumulado hasta esta semana
  porcentajeAjustado?: number; // Si el residente corrige manualmente
  motivoAjuste?: string;
  reportadoPor: string;
  fechaReporte: string;
  notas?: string;
}

// CONCEPTO DEL PRESUPUESTO (La tabla de 6 columnas)
export interface ConceptoPresupuesto {
  id: string;
  num: number; // No. de partida
  concepto: string; // Descripción
  cantidad: number; // Total presupuestado
  unidad: string; // m3, m2, kg, etc.
  costoUnitario: number;
  importe: number; // cantidad * costoUnitario
  tipo: TipoConcepto; // material | mano_obra | equipo_herramienta
  
  // AVANCE (Automático pero ajustable)
  metodoCalculo: 'cantidad' | 'porcentaje_directo';
  registrosSemanales: RegistroAvanceSemanal[];
  cantidadAcumuladaEjecutada: number; // Suma automática
  porcentajeAvanceCalculado: number; // (acumulado/total)*100
  porcentajeAvanceFinal: number; // Si hay ajuste, usa este, si no, el calculado
  
  // PRESUPUESTO vs REAL
  presupuesto: number; // importe (lo que se planeó gastar)
  gastoReal: number; // Lo que realmente se ha gastado (se actualiza con compras/nominas)
}

// PRESUPUESTO DESGLOSADO (Las 3 subcategorías)
export interface PresupuestoObra {
  conceptos: ConceptoPresupuesto[];
  
  // Subtotales por tipo (calculados automáticamente)
  sumaMateriales: number; // Suma de importes tipo 'material'
  sumaManoObra: number; // Suma de importes tipo 'mano_obra'
  sumaEquipoHerramienta: number; // Suma de importes tipo 'equipo_herramienta'
  costoDirecto: number; // Suma de los 3 anteriores
  
  indirectos: number; // 15% de indirectos (o el % que configures)
  utilidad: number; // % de utilidad
  totalPresupuesto: number; // costoDirecto + indirectos + utilidad
}

// OBRA COMPLETA
export interface Obra {
  id: string;
  nombre: string;
  ubicacion: string;
  ambito: 'publica' | 'privada';
  fechaInicio: string;
  fechaTermino: string;
  tipoRecurso: 'propio' | 'financiamiento' | 'prestamo';
  residenteId: string;
  residenteName?: string;
  estado: EstadoObra;
  
  // PRESUPUESTO DETALLADO
  presupuesto: PresupuestoObra;
  
  // GASTOS REALES ACUMULADOS (se actualizan automáticamente)
  gastoRealMateriales: number; // Suma de facturas de materiales
  gastoRealManoObra: number; // Suma de nóminas pagadas
  gastoRealEquipo: number; // Suma de rentas/compras equipo
  gastoTotalReal: number; // Suma de los 3 anteriores
  
  // AVANCES GLOBALES (calculados de los conceptos)
  avanceFisicoGlobal: number; // Promedio de porcentajeAvanceFinal de todos los conceptos
  avanceFinancieroGlobal: number; // (gastoTotalReal / totalPresupuesto) * 100
  
  // SEMANA ACTUAL DE REPORTE
  semanaActualReporte: number;
  
  createdAt: string;
  updatedAt: string;
}

export type EstadoNomina = 'pendiente' | 'validada' | 'autorizada' | 'pagada';

export interface NominaEmpleado {
  id: string;
  nombre: string;
  puesto: string;
  dias: {
    lun: number; mar: number; mie: number; jue: number; vie: number; sab: number; dom: number;
  };
  totalDias: number;
  salarioDiario: number;
  totalSemana: number;
  observaciones: string;
}

export interface Nomina {
  id: string;
  obraId: string;
  obraName?: string;
  semanaDel: string;
  semanaAl: string;
  fechaElaboracion: string;
  empleados: NominaEmpleado[];
  totalNomina: number;
  estado: EstadoNomina;
  residenteId: string;
  residenteName?: string;
  conceptoManoObraId?: string; // Vinculado a qué partida de mano de obra
  validadaAt?: string;
  autorizadaAt?: string;
  pagadaAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialComprado {
  id: string;
  obraId: string;
  conceptoId?: string; // Vinculado a qué partida del presupuesto
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  importe: number;
  fecha: string;
  proveedor: string;
  factura?: string;
}

export interface DashboardStats {
  totalObras: number;
  obrasActivas: number;
  obrasTerminadas: number;
  
  // Financieros
  totalPresupuestado: number; // Suma de todos los presupuestos totales
  totalEjercido: number; // Suma de todos los gastos reales
  totalPorEjercer: number; // totalPresupuestado - totalEjercido
  
  // Por tipo
  totalMaterialesPresupuesto: number;
  totalMaterialesEjercido: number;
  totalManoObraPresupuesto: number;
  totalManoObraEjercido: number;
  totalEquipoPresupuesto: number;
  totalEquipoEjercido: number;
  
  // Nóminas
  nominasPendientes: number;
  nominasValidadas: number;
  nominasAutorizadas: number;
  nominasPagadas: number;
}

export interface ObraFinanzas {
  obraId: string;
  obraName: string;
  
  // Presupuesto
  presupuestoTotal: number;
  presupuestoMateriales: number;
  presupuestoManoObra: number;
  presupuestoEquipo: number;
  
  // Gasto Real
  gastoMateriales: number;
  gastoManoObra: number;
  gastoEquipo: number;
  gastoTotal: number;
  
  // Avances
  avanceFisico: number;
  avanceFinanciero: number;
  
  // Análisis
  desviacionPresupuestal: number; // %
  balance: number; // presupuestoTotal - gastoTotal (positivo = ahorro, negativo = sobrecosto)
}

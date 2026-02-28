// SISTEMA SISMICH - CONTROL DE OBRA CIVIL INTEGRAL
// Basado en formatos Excel reales de la empresa
// SISMICH - Tipos compatibles (no romper lo existente)

export type UserRole = 'admin' | 'residente' | 'contadora';
export type EstadoObra = 'activa' | 'terminada' | 'cancelada';
export type TipoConcepto = 'material' | 'mano_obra' | 'equipo';

// ==========================================
// USUARIOS (igual)
// ==========================================
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

// ==========================================
// PRESUPUESTO (NUEVO - pero compatible)
// ==========================================
export interface ConceptoPresupuesto {
  id: string;
  num: number;
  concepto: string;
  cantidad: number;
  unidad: string;
  costoUnitario: number;
  importe: number;
  tipo: TipoConcepto;
  avancePorcentaje?: number;
  cantidadEjecutada?: number;
  gastoReal?: number;
}

export interface PresupuestoObra {
  conceptos: ConceptoPresupuesto[];
  sumaMateriales: number;
  sumaManoObra: number;
  sumaEquipo: number;
  costoDirecto: number;
  indirectos: number;
  totalPresupuesto: number;
}

// ==========================================
// OBRA (COMPATIBLE - mantiene campos antiguos + nuevos opcionales)
// ==========================================
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
  
  // PARA CÓDIGO ANTIGUO (mantener)
  presupuesto: number;  // Este es el número total (código antiguo lo usa)
  
  // PARA CÓDIGO NUEVO (opcional)
  presupuestoDetallado?: PresupuestoObra;  // El objeto completo (nuevo)
  
  // Campos nuevos opcionales (para no romper datos existentes)
  gastoRealMateriales?: number;
  gastoRealManoObra?: number;
  gastoRealEquipo?: number;
  gastoTotalReal?: number;
  avanceFisicoGlobal?: number;
  avanceFinancieroGlobal?: number;
  
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// NÓMINA (COMPATIBLE - con campos que esperan los componentes)
// ==========================================
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
  estado: 'pendiente' | 'validada' | 'autorizada' | 'pagada';
  
  // IMPORTANTE: Campos que usan los componentes antiguos
  residenteId: string;        // Lo necesita ResidenteDashboard
  residenteName?: string;     // Lo necesita NominaDetail
  
  // Opcionales
  validadaAt?: string;
  autorizadaAt?: string;
  pagadaAt?: string;
  elaboro?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// CAJA CHICA (NUEVO)
// ==========================================
export interface GastoCajaChica {
  id: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  observaciones: string;
}

export interface CajaChica {
  id: string;
  obraId: string;
  semanaDel: string;
  semanaAl: string;
  saldoAnterior: number;
  importeEntregado: number;
  totalComprobado: number;
  gastos: GastoCajaChica[];
  saldoEnCaja: number;
  fechaElaboracion: string;
  createdAt: string;
}

// ==========================================
// DOCUMENTOS (para ObrasManager)
// ==========================================
export interface DocumentoObra {
  id: string;
  obraId: string;
  tipo: string;
  nombre: string;
  fileName: string;
  fileData: string;
  uploadedAt: string;
  uploadedBy: string;
}

// ==========================================
// DASHBOARD (compatible)
// ==========================================
export interface DashboardStats {
  totalObras: number;
  obrasActivas: number;
  obrasTerminadas: number;
  totalInversion: number;      // Código antiguo lo usa
  totalManoObra: number;       // Código antiguo lo usa
  totalMateriales: number;
  gananciaPerdida: number;     // Código antiguo lo usa
  nominasPendientes: number;
  nominasAutorizadas: number;
  nominasPagadas?: number;
}

export interface ObraFinanzas {
  obraId: string;
  obraName: string;
  presupuesto: number;         // Compatible con código antiguo
  manoObraTotal: number;
  materialesTotal: number;
  gastosTotal: number;
  avanceFisico: number;
  avanceFinanciero: number;
  desviacionPresupuestal: number;
  roi?: number;
  balance: number;
}

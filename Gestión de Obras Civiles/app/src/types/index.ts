// SISTEMA SISMICH - CONTROL DE OBRA CIVIL INTEGRAL

export type UserRole = 'admin' | 'residente' | 'contadora';
export type EstadoObra = 'activa' | 'terminada' | 'cancelada';
export type TipoConcepto = 'material' | 'mano_obra' | 'equipo';
export type ObraAmbito = 'publica' | 'privada';
export type TipoRecurso = 'propio' | 'financiamiento' | 'prestamo';

// USUARIOS
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

// PRESUPUESTO
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
  // Nuevos campos que faltaban:
  porcentajeAvanceAjustado?: number;
  porcentajeAvanceCalculado?: number;
  porcentajeAvanceFinal?: number;
  cantidadAcumuladaEjecutada?: number;
  registrosSemanales?: any[];
}

export interface PresupuestoObra {
  conceptos: ConceptoPresupuesto[];
  sumaMateriales: number;
  sumaManoObra: number;
  sumaEquipo?: number;
  costoDirecto: number;
  indirectos: number;
  indirectosPorcentaje?: number;
  utilidadMonto?: number;
  utilidadPorcentaje?: number;
  totalPresupuesto: number;
}

export interface Obra {
  id: string;
  nombre: string;
  ubicacion: string;
  municipio?: string;
  ambito: ObraAmbito;
  fechaInicio: string;
  fechaTermino: string;
  tipoRecurso: TipoRecurso;
  residenteId: string;
  residenteName?: string;
  estado: EstadoObra;
  semanaActualReporte?: number;
  
  
  // ✅ CAMBIO: Ahora presupuesto es el objeto
  presupuesto: PresupuestoObra;
  presupuestoTotal?: number;  // Opcional, por si necesitas el total como número separado
  registrosAvance?: RegistroAvanceSemanal[]; 
  
  // ... resto de campos (totalManoObra, gastoRealMateriales, etc.)
  totalManoObra?: number;
  totalMateriales?: number;
  gastoRealMateriales?: number;
  gastoRealManoObra?: number;
  gastoRealEquipo?: number;
  gastoTotalReal?: number;
  avanceFisicoGlobal?: number;
  avanceFinancieroGlobal?: number;
  
  partidas?: any[];
  nominasIds?: string[];
  requisicionesIds?: string[];
  destajosIds?: string[];
  
  createdAt: string;
  updatedAt: string;
}

// NÓMINA
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
  numeroSemana?: number;  // Campo que faltaba
  empleados: NominaEmpleado[];
  totalNomina: number;
  estado: 'pendiente' | 'validada' | 'autorizada' | 'pagada' | 'rechazada';
  
  residenteId: string;
  residenteName?: string;
  
  // Campos para el flujo de autorización
  validadaAt?: string;
  autorizadaAt?: string;
  pagadaAt?: string;
  autorizo?: string;  // Campo que faltaba
  elaboro?: string;
  
  createdAt: string;
  updatedAt: string;
}

// CAJA CHICA
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

// DOCUMENTOS
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

// DASHBOARD
export interface DashboardStats {
  totalObras: number;
  obrasActivas: number;
  obrasTerminadas: number;
  totalInversion: number;
  totalManoObra: number;
  totalMateriales: number;
  gananciaPerdida: number;
  nominasPendientes: number;
  nominasAutorizadas: number;
  nominasPagadas?: number;
}

export interface ObraFinanzas {
  obraId: string;
  obraName: string;
  presupuesto: number;
  presupuestoTotal?: number;
  manoObraTotal: number;
  materialesTotal: number;
  gastosTotal: number;
  avanceFisico: number;
  avanceFinanciero: number;
  desviacionPresupuestal: number;
  roi?: number;
  balance?: number;  // Opcional ahora
}

// NUEVO: RegistroAvanceSemanal que faltaba
export interface RegistroAvanceSemanal {
  id?: string;
  semana: number;
  semanaDel?: string;
  semanaAl?: string;
  numeroSemana?: number;
  cantidadEjecutada?: number;
  porcentajeEstaSemana?: number;
  porcentajeAcumulado?: number;
  porcentajeAjustado?: number;
  motivoAjuste?: string;
  reportadoPor?: string;
  fechaReporte?: string;
  fechaInicio?: string;
  fechaFin?: string;
  porcentajeAvance?: number; 
  notas?: string;
}

// Agregar al final de types/index.ts

// MATERIALES
export interface MaterialRequerido {
  id: string;
  clave?: string;
  partida: string;
  concepto: string;
  descripcion: string;
  unidad: string;
  cantidadRequerida: number;
  observaciones?: string;
}

export interface RequisicionMaterial {
  id: string;
  obraId: string;
  fechaSolicitud: string;
  fechaEntregaSolicitada: string;
  periodo?: string;
  materiales: MaterialRequerido[];
  status: 'pendiente' | 'aprobada' | 'rechazada' | 'parcial';
  solicitanteId: string;
  solicitanteName?: string;
  totalMateriales?: number;
}

export interface CalculoMaterial {
  elemento: string;
  largo: number;
  ancho: number;
  alto?: number;
  piezas: number;
  cantidadCalculada: number;
  desperdicio: number; // ej: 0.10 = 10%
}

// EQUIPOS
export interface RentaEquipo {
  id: string;
  obraId: string;
  concepto: string;
  equipo: string; // Andamios, Bailarinas, etc.
  fecha: string;
  horaInicio: string;
  horaTermino: string;
  totalHoras: number;
  totalDias: number;
  precioPorDia: number;
  importe: number;
  descripcionTrabajo: string; // Esto alimenta avance físico
  proveedor?: string;
  statusPago: 'pendiente' | 'pagado';
  semanaReporte?: number;
}

// DESTAJOS
export interface EstimacionDestajo {
  numero: number;
  fecha: string;
  presupuestado: { cantidad: number; importe: number; };
  acumuladoAnterior: { cantidad: number; importe: number; };
  presenteEjercicio: { cantidad: number; importe: number; };
  acumuladoTotal: { cantidad: number; importe: number; };
  porEjecutar: { cantidad: number; importe: number; };
}

export interface Destajo {
  id: string;
  obraId: string;
  frente: string; // CANCHA SAHUAYO
  partida: string;
  concepto: string;
  costoTotal: number;
  porcentajeGarantia: number; // 10%
  garantiaRetenida: number;
  depositoRealizado: number;
  estimaciones: EstimacionDestajo[];
  status: 'en_proceso' | 'pagado' | 'terminado';
  contratista?: string;
}

// COMBUSTIBLE (Integrado a Caja Chica pero con estructura propia)
export interface RecorridoCombustible {
  dia: 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado' | 'Domingo';
  origen: string;
  destino: string;
  kmRecorridos: number;
  rendimiento: number; // km/l
  litros: number;
  precioPorLitro: number;
  importe: number;
}

export interface RequisicionCombustible {
  id: string;
  obraId: string;
  vehiculo: string; // FRONTIER
  placas: string; // MW7852D
  semanaDel: string;
  semanaAl: string;
  recorridos: RecorridoCombustible[];
  totalImporte: number;
  status: 'pendiente' | 'aprobada';
}
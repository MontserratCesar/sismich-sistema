// Tipos del Sistema SISMICH

export type UserRole = 'admin' | 'residente' | 'contadora';

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

export type ObraAmbito = 'publica' | 'privada';
export type TipoRecurso = 'propio' | 'financiamiento' | 'prestamo';
export type EstadoObra = 'activa' | 'terminada' | 'cancelada';

export interface Obra {
  id: string;
  nombre: string;
  ubicacion: string;
  ambito: ObraAmbito;
  fechaInicio: string;
  fechaTermino: string;
  tipoRecurso: TipoRecurso;
  residenteId: string;
  residenteName?: string;
  estado: EstadoObra;
  presupuesto: number;
  createdAt: string;
  updatedAt: string;
}

export type EstadoNomina = 'pendiente' | 'validada' | 'autorizada' | 'pagada';

export interface NominaEmpleado {
  id: string;
  nombre: string;
  puesto: string;
  dias: {
    lun: number;
    mar: number;
    mie: number;
    jue: number;
    vie: number;
    sab: number;
    dom: number;
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
  validadaAt?: string;
  autorizadaAt?: string;
  pagadaAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentoObra {
  id: string;
  obraId: string;
  tipo: 'contrato' | 'presupuesto' | 'factura' | 'orden_compra' | 'caja_chica' | 'nota_materiales' | 'otro';
  nombre: string;
  fileName: string;
  fileData: string; // base64
  uploadedAt: string;
  uploadedBy: string;
}

export interface Material {
  id: string;
  obraId: string;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  fecha: string;
  proveedor?: string;
}

export interface OrdenCompra {
  id: string;
  obraId: string;
  obraName?: string;
  proveedor: string;
  contacto: string;
  formaPago: string;
  residenteId: string;
  fecha: string;
  items: {
    area: string;
    cantidad: number;
    unidad: string;
    descripcion: string;
    precioUnitario: number;
    importe: number;
  }[];
  subtotal: number;
  iva: number;
  total: number;
  observaciones: string;
}

export interface CajaChica {
  id: string;
  obraId: string;
  obraName?: string;
  municipio: string;
  periodo: string;
  fechaElaboracion: string;
  hoja: number;
  de: number;
  items: {
    descripcion: string;
    unidad: string;
    cantidad: number;
    precioUnitario: number;
    importe: number;
    observaciones: string;
  }[];
  total: number;
  saldoTotal: number;
  entregaEfectivo: number;
  sumaEntregada: number;
  saldoEnCaja: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string, role: UserRole) => boolean;
  logout: () => void;
}

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
}

export interface ObraFinanzas {
  obraId: string;
  obraName: string;
  presupuesto: number;
  manoObraTotal: number;
  materialesTotal: number;
  gastosTotal: number;
  avanceFisico: number;
  avanceFinanciero: number;
  desviacionPresupuestal: number;
  roi: number;
}

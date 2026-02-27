// SISTEMA SISMICH - CONTROL DE OBRA CIVIL INTEGRAL
// Basado en formatos Excel reales de la empresa

export type UserRole = 'admin' | 'residente' | 'contadora';
export type EstadoObra = 'activa' | 'terminada' | 'cancelada';
export type TipoConcepto = 'material' | 'mano_obra' | 'equipo' | 'destajo' | 'indirecto';

// ==========================================
// 1. USUARIOS
// ==========================================
export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  firma?: string; // URL de imagen de firma para reportes
  createdAt: string;
  isActive: boolean;
}

// ==========================================
// 2. PRESUPUESTO BASE (6 columnas estándar)
// ==========================================
export interface ConceptoPresupuesto {
  id: string;
  num: number;           // Número de partida
  concepto: string;      // Descripción (ej: "Cimentación")
  cantidad: number;      // Cantidad total presupuestada
  unidad: string;        // m3, m2, kg, etc.
  costoUnitario: number; // Precio unitario
  importe: number;       // cantidad * costoUnitario
  
  // Categorización para los 3 tipos
  tipo: 'material' | 'mano_obra' | 'equipo';
  
  // Avance físico real (registrado por residente)
  avancePorcentaje: number; // 0-100%
  cantidadEjecutada: number; // cantidad * (avance/100)
  
  // Gasto real acumulado (se actualiza con facturas/nóminas)
  gastoReal: number;
}

export interface PresupuestoObra {
  conceptos: ConceptoPresupuesto[];
  
  // Subtotales (cálculo automático)
  sumaMateriales: number;
  sumaManoObra: number;
  sumaEquipo: number;
  costoDirecto: number;
  
  // Indirectos y utilidad (configurable por obra)
  indirectosPorcentaje: number; // Ej: 15%
  indirectosMonto: number;
  utilidadPorcentaje: number;   // Ej: 10%
  utilidadMonto: number;
  
  totalPresupuesto: number;
}

// ==========================================
// 3. MÓDULO NÓMINA (Reporte semanal)
// ==========================================
export interface NominaEmpleado {
  id: string;
  nombre: string;
  puesto: string;
  
  // Días laborados (1 = trabajó, 0 = no trabajó, 0.5 = medio día)
  dias: {
    lun: number;
    mar: number;
    mie: number;
    jue: number;
    vie: number;
    sab: number;
    dom: number;
  };
  
  totalDias: number;      // Suma automática de días
  salarioDiario: number;
  totalSemana: number;    // totalDias * salarioDiario
  observaciones: string;
}

export interface Nomina {
  id: string;
  obraId: string;
  obraName?: string;
  
  // Periodo
  semanaDel: string;      // Fecha inicio (YYYY-MM-DD)
  semanaAl: string;       // Fecha fin
  numeroSemana: number;   // Semana 1, 2, 3...
  
  fechaElaboracion: string;
  
  // Empleados
  empleados: NominaEmpleado[];
  totalNomina: number;    // Suma automática
  
  // Firmas (para el reporte PDF)
  elaboro: string;        // Nombre del residente
  reviso?: string;        // Superintendente
  autorizo?: string;      // Director
  
  // Estado contable
  estado: 'pendiente' | 'validada' | 'autorizada' | 'pagada';
  validadaAt?: string;
  autorizadaAt?: string;
  pagadaAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. MÓDULO COMBUSTIBLE
// ==========================================
export interface RegistroCombustible {
  id: string;
  obraId: string;
  semanaDel: string;
  semanaAl: string;
  
  // Vehículo
  vehiculo: string;       // Ej: "FRONTIER"
  placas: string;         // Ej: "MW7852D"
  
  // Registro diario
  dias: {
    lun?: { origen: string; destino: string; km: number; litros: number; importe: number; };
    mar?: { origen: string; destino: string; km: number; litros: number; importe: number; };
    mie?: { origen: string; destino: string; km: number; litros: number; importe: number; };
    jue?: { origen: string; destino: string; km: number; litros: number; importe: number; };
    vie?: { origen: string; destino: string; km: number; litros: number; importe: number; };
    sab?: { origen: string; destino: string; km: number; litros: number; importe: number; };
    dom?: { origen: string; destino: string; km: number; litros: number; importe: number; };
  };
  
  // Totales semana
  totalKm: number;
  totalLitros: number;
  totalImporte: number;
  rendimientoPromedio: number; // km/litro
  
  // Solicitante
  solicitante: string;
  fechaSolicitud: string;
  
  createdAt: string;
}

// ==========================================
// 5. MÓDULO CAJA CHICA (Gastos indirectos)
// ==========================================
export interface GastoCajaChica {
  id: string;
  obraId: string;
  semanaDel: string;
  semanaAl: string;
  
  num: number;
  descripcion: string;    // Ej: "MATERIAL HIDRAULICO", "GASOLINA"
  unidad: string;         // NOTA, FACTURA, TICKET
  cantidad: number;
  precioUnitario: number;
  importe: number;
  observaciones: string;  // Ej: "PAGO EL ING. VLAS"
  
  createdAt: string;
}

export interface CajaChica {
  id: string;
  obraId: string;
  semanaDel: string;
  semanaAl: string;
  
  // Control de saldos
  saldoAnterior: number;
  importeEntregado: number;  // Lo que dan para la semana
  totalComprobado: number;   // Suma de gastos
  
  gastos: GastoCajaChica[];
  
  saldoEnCaja: number;       // (SaldoAnterior + Entregado) - Comprobado
  
  fechaElaboracion: string;
  createdAt: string;
}

// ==========================================
// 6. MÓDULO DESTAJOS (Subcontratos)
// ==========================================
export interface EstimacionDestajo {
  id: string;
  numeroEstimacion: number;  // 1ra, 2da, 3ra...
  
  // Avance de esta estimación
  cantidadEjercida: number;
  importeEjercido: number;
  
  // Acumulado (suma de todas las estimaciones anteriores + esta)
  cantidadAcumulada: number;
  importeAcumulado: number;
  
  // Por ejecutar (presupuesto - acumulado)
  cantidadPorEjecutar: number;
  importePorEjecutar: number;
  
  fecha: string;
}

export interface ContratoDestajo {
  id: string;
  obraId: string;
  
  // Empresa contratista
  empresa: string;           // Ej: "JESUS BEDOLLA SANDOVAL"
  representante?: string;
  
  // Concepto del trabajo
  partida: string;           // Ej: "PAILERIA"
  concepto: string;          // Ej: "HABILITADO DE TREN DE DESCARGA..."
  
  // Presupuesto contratado
  cantidadTotal: number;
  unidad: string;
  precioUnitario: number;
  importeTotal: number;      // Costo total del contrato
  
  // Garantía
  porcentajeGarantia: number; // Ej: 10%
  montoGarantia: number;
  
  // Estimaciones
  estimaciones: EstimacionDestajo[];
  
  // Totales calculados
  totalAcumulado: number;    // Suma de todas las estimaciones
  totalPorEjecutar: number;  // importeTotal - totalAcumulado
  
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 7. MÓDULO REQUISICIONES DE MATERIAL
// ==========================================
export interface ItemRequisicion {
  id: string;
  clave?: string;           // Ej: "BAST01"
  partida?: string;         // Ej: "LINDEROS"
  descripcionConcepto: string;  // Ej: "ACCESO RANCHO MALBORO"
  materialSolicitado: string;   // Ej: "CEMENTO GRIS"
  unidad: string;           // BULTO, PZA, KG
  cantidadRequerida: number;
  observaciones?: string;
  enlace?: string;          // URL a cotización/proveedor
}

export interface RequisicionMaterial {
  id: string;
  obraId: string;
  
  periodo: string;          // Ej: "DEL 18 AL 24 DE OCTUBRE"
  fechaSolicitud: string;
  fechaEntregaRequerida?: string;
  
  items: ItemRequisicion[];
  
  solicitante: string;
  puesto: string;
  
  // Estado
  estado: 'pendiente' | 'cotizando' | 'autorizada' | 'comprada' | 'entregada';
  
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 8. MÓDULO ALMACÉN (Entradas/Salidas)
// ==========================================
export interface MovimientoAlmacen {
  id: string;
  obraId: string;
  
  tipo: 'entrada' | 'salida';
  fecha: string;
  
  // Material
  descripcion: string;
  unidad: string;
  cantidad: number;
  
  // Valoración (precio promedio o último)
  precioUnitario: number;
  importe: number;
  
  // Referencia
  requisicionId?: string;   // Si es entrada, de qué requisición viene
  destino?: string;         // Si es salida, a qué área/destajo se va
  
  stockResultante: number;  // Cantidad en almacén después de este movimiento
  
  registradoPor: string;
  createdAt: string;
}

// ==========================================
// 9. OBRA MAESTRA (Todo conectado aquí)
// ==========================================
export interface Obra {
  id: string;
  nombre: string;           // Ej: "CARCAMO LAS AGUILAS"
  ubicacion: string;        // Ej: "MORELIA"
  municipio: string;
  
  // Fechas
  fechaInicio: string;
  fechaTermino: string;
  fechaContrato?: string;
  
  // Administrativos
  ambito: 'publica' | 'privada';
  tipoRecurso: 'propio' | 'financiamiento' | 'prestamo';
  
  // Responsables
  residenteId: string;
  residenteName?: string;
  superintendente?: string;  // Para firmas de reportes
  director?: string;         // Para firmas de reportes
  
  estado: EstadoObra;
  
  // Presupuesto base
  presupuesto: PresupuestoObra;
  
  // Módulos vinculados (IDs para no cargar todo en memoria)
  nominasIds: string[];
  requisicionesIds: string[];
  destajosIds: string[];
  combustiblesIds: string[];
  cajasChicasIds: string[];
  
  // Acumulados en tiempo real (se actualizan automáticamente)
  acumulados: {
    nominaTotal: number;           // Suma de todas las nóminas pagadas
    materialesTotal: number;       // Suma de facturas de materiales
    destajosTotal: number;         // Suma de estimaciones de destajo
    combustibleTotal: number;      // Suma de combustible
    cajaChicaTotal: number;        // Suma de gastos indirectos
    
    totalEjercido: number;         // Suma de todo lo anterior
    
    avanceFisico: number;          // % real de avance (de presupuesto.avancePorcentaje promedio)
    avanceFinanciero: number;      // (totalEjercido / presupuesto.totalPresupuesto) * 100
  };
  
  // Control de semanas
  semanaActual: number;      // Para saber en qué semana van
  
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 10. DASHBOARD Y REPORTES
// ==========================================
export interface DashboardStats {
  // Obras
  totalObras: number;
  obrasActivas: number;
  obrasTerminadas: number;
  
  // Financieros globales
  presupuestoTotal: number;     // Suma de todos los presupuestos
  ejercidoTotal: number;        // Suma de todos los gastos
  disponibleTotal: number;      // presupuesto - ejercido
  
  // Por tipo de gasto (global de todas las obras)
  totalNomina: number;
  totalMateriales: number;
  totalDestajos: number;
  totalCombustible: number;
  totalCajaChica: number;
  
  // Alertas
  obrasSobrePresupuesto: number;
  obrasConRetraso: number;
  
  // Pendientes
  nominasPorPagar: number;
  requisicionesPendientes: number;
  destajosPorEstimar: number;
}

export interface AlertaFinanciera {
  tipo: 'critico' | 'advertencia' | 'info';
  obraId: string;
  obraNombre: string;
  mensaje: string;
  monto?: number;
  fecha: string;
}

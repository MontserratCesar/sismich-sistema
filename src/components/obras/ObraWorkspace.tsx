import { useState } from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  Package, 
  Truck, 
  Users, 
  Hammer, 
  Wallet, 
  TrendingUp, 
  FileText,
  ArrowLeft,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import type { 
  Obra, 
  Nomina, 
  CajaChica, 
  User, 
  DocumentoObra,
  RequisicionMaterial,
  RentaEquipo,
  Destajo,
  RequisicionCombustible 
} from '@/types';

// Import de tus componentes existentes (ajusta rutas según tu estructura)
import { NominaForm } from '@/components/nominas/NominaForm';
import { CajaChicaForm } from '@/components/caja-chica/CajaChicaForm';
import { PresupuestoForm } from '@/components/presupuesto/PresupuestoForm';
import { AvanceSemanalForm } from '@/components/avance/AvanceSemanalForm';
import { NominaDetail } from '@/components/nominas/NominaDetail';
import { MaterialesManager } from '@/components/materiales/MaterialesManager';
import { EquiposManager } from '@/components/equipos/EquiposManager';

interface ObraWorkspaceProps {
  obra: Obra;
  currentUser: User;
  onBack: () => void;
  
  // Props de datos
  nominas: Nomina[];
  cajasChica?: CajaChica[];
  documentos?: DocumentoObra[];
  requisiciones?: RequisicionMaterial[];
  equipos?: RentaEquipo[];
  destajos?: Destajo[];
  
  // Props de handlers (los que ya tienes en App.tsx)
  onSaveNomina: (data: any) => void;
  onSaveCajaChica: (data: any) => void;
  onSavePresupuesto: (presupuesto: any) => void;
  onGuardarAvance: (avance: any) => void;
  onCambiarEstadoNomina?: (id: string, estado: Nomina['estado']) => void;
  
  // Nuevos handlers (placeholders por ahora)
  onCreateRequisicion?: (data: RequisicionMaterial) => void;
  onCreateEquipo?: (data: RentaEquipo) => void;
  onCreateDestajo?: (data: Destajo) => void;
}

type TabId = 'dashboard' | 'presupuesto' | 'materiales' | 'equipos' | 'nominas' | 'destajos' | 'cajachica' | 'avance' | 'documentos';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
  roles: User['role'][];
  badge?: string;
}

export function ObraWorkspace({
  obra,
  currentUser,
  onBack,
  nominas,
  cajasChica = [],
  documentos = [],
  onSaveNomina,
  onSaveCajaChica,
  onSavePresupuesto,
  onGuardarAvance,
  onCambiarEstadoNomina
}: ObraWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  
  // Estados para formularios dentro de tabs
  const [showNominaForm, setShowNominaForm] = useState(false);
  const [showCajaChicaForm, setShowCajaChicaForm] = useState(false);
  const [showPresupuestoForm, setShowPresupuestoForm] = useState(false);
  const [showAvanceForm, setShowAvanceForm] = useState(false);
  const [selectedNomina, setSelectedNomina] = useState<Nomina | null>(null);
  
  // Filtrar nóminas de esta obra
  const nominasDeObra = nominas.filter(n => n.obraId === obra.id);
  const tienePresupuesto = obra.presupuesto && obra.presupuesto.totalPresupuesto > 0;

  const tabs: TabConfig[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'contadora', 'residente'] },
    { id: 'presupuesto', label: 'Presupuesto', icon: Calculator, roles: ['admin', 'contadora', 'residente'] },
    { id: 'materiales', label: 'Materiales', icon: Package, roles: ['admin', 'residente'] },
    { id: 'equipos', label: 'Equipos', icon: Truck, roles: ['admin', 'residente'] },
    { id: 'nominas', label: 'Nóminas', icon: Users, roles: ['admin', 'contadora', 'residente'], badge: nominasDeObra.filter(n => n.estado === 'pendiente').length > 0 ? nominasDeObra.filter(n => n.estado === 'pendiente').length.toString() : undefined },
    { id: 'destajos', label: 'Destajos', icon: Hammer, roles: ['admin', 'residente'] },
    { id: 'cajachica', label: 'Caja Chica', icon: Wallet, roles: ['admin', 'contadora', 'residente'] },
    { id: 'avance', label: 'Avance Físico', icon: TrendingUp, roles: ['admin', 'residente'] },
    { id: 'documentos', label: 'Documentos', icon: FileText, roles: ['admin', 'contadora', 'residente'] },
  ];

  const filteredTabs = tabs.filter(tab => tab.roles.includes(currentUser.role));

  // Handler de Cerrar Semana (Integración mágica)
  const handleCerrarSemana = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          // Aquí irá la lógica de:
          // 1. Generar nómina automática basada en asistencias
          // 2. Reportar avance físico
          // 3. Cerrar caja chica
          // 4. Generar PDF
          resolve(true);
        }, 2000);
      }),
      {
        loading: 'Procesando cierre de semana...',
        success: 'Semana cerrada exitosamente. Nómina y avance generados.',
        error: 'Error al cerrar semana',
      }
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Resumen Ejecutivo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Presupuesto Total</p>
                <p className="text-2xl font-bold text-blue-900">
                  ${obra.presupuesto?.totalPresupuesto?.toLocaleString('es-MX') || 0}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-600 font-medium">Gasto Real</p>
                <p className="text-2xl font-bold text-orange-900">
                  ${obra.gastoTotalReal?.toLocaleString('es-MX') || 0}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 font-medium">Avance Físico</p>
                <p className="text-2xl font-bold text-green-900">
                  {obra.avanceFisicoGlobal || 0}%
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600 font-medium">Nóminas Pendientes</p>
                <p className="text-2xl font-bold text-purple-900">
                  {nominasDeObra.filter(n => n.estado === 'pendiente').length}
                </p>
              </div>
            </div>

            {/* Alertas Inteligentes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Estado del Proyecto
              </h3>
              <div className="space-y-3">
                {obra.avanceFinancieroGlobal > 100 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="font-bold">Desviación Presupuestal Mayor al 100%</p>
                      <p className="text-sm">El gasto real ha superado el presupuesto aprobado.</p>
                    </div>
                  </div>
                )}
                {obra.avanceFisicoGlobal < 50 && obra.avanceFinancieroGlobal > 60 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="font-bold">Alerta de Eficiencia</p>
                      <p className="text-sm">Has gastado el {obra.avanceFinancieroGlobal?.toFixed(1)}% del presupuesto pero solo llevas el {obra.avanceFisicoGlobal}% de avance físico.</p>
                    </div>
                  </div>
                )}
                {!tienePresupuesto && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                    <span className="text-2xl">📋</span>
                    <div>
                      <p className="font-bold">Presupuesto Pendiente</p>
                      <p className="text-sm">Esta obra no tiene presupuesto registrado.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Acceso Rápido */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setActiveTab('nominas')}
                className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <p className="font-semibold">Nómina Semanal</p>
                <p className="text-xs text-gray-500">{nominasDeObra.length} registradas</p>
              </button>
              <button 
                onClick={() => setActiveTab('cajachica')}
                className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <Wallet className="w-8 h-8 text-green-600 mb-2" />
                <p className="font-semibold">Caja Chica</p>
                <p className="text-xs text-gray-500">{cajasChica.length} semanas</p>
              </button>
              <button 
                onClick={() => setActiveTab('materiales')}
                className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <Package className="w-8 h-8 text-orange-600 mb-2" />
                <p className="font-semibold">Materiales</p>
                <p className="text-xs text-gray-500">Ver requisiciones</p>
              </button>
              <button 
                onClick={() => setActiveTab('avance')}
                className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
                <p className="font-semibold">Reportar Avance</p>
                <p className="text-xs text-gray-500">Semana {(obra.semanaActualReporte || 0) + 1}</p>
              </button>
            </div>
          </div>
        );

      case 'presupuesto':
        if (showPresupuestoForm || !tienePresupuesto) {
          return (
            <PresupuestoForm
              obraId={obra.id}
              obraName={obra.nombre}
              presupuestoExistente={tienePresupuesto ? obra.presupuesto : undefined}
              onSave={(presupuesto) => {
                onSavePresupuesto(presupuesto);
                setShowPresupuestoForm(false);
              }}
              onCancel={() => setShowPresupuestoForm(false)}
            />
          );
        }
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Presupuesto de Obra</h2>
              <Button onClick={() => setShowPresupuestoForm(true)} variant="outline">
                Editar Presupuesto
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">Materiales</p>
                <p className="text-xl font-bold">${obra.presupuesto?.sumaMateriales?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded">
                <p className="text-sm text-gray-600">Mano de Obra</p>
                <p className="text-xl font-bold">${obra.presupuesto?.sumaManoObra?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p className="text-sm text-gray-600">Equipo</p>
                <p className="text-xl font-bold">${obra.presupuesto?.sumaEquipo?.toLocaleString() || 0}</p>
              </div>
              <div className="bg-gray-900 text-white p-4 rounded">
                <p className="text-sm text-gray-300">Total</p>
                <p className="text-2xl font-bold">${obra.presupuesto?.totalPresupuesto?.toLocaleString() || 0}</p>
              </div>
            </div>

            {/* Detalle de conceptos */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Concepto</th>
                    <th className="px-4 py-2 text-right">Cantidad</th>
                    <th className="px-4 py-2 text-right">Unitario</th>
                    <th className="px-4 py-2 text-right">Importe</th>
                    <th className="px-4 py-2 text-center">Avance</th>
                  </tr>
                </thead>
                <tbody>
                  {obra.presupuesto?.conceptos?.map((concepto, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">{concepto.concepto}</td>
                      <td className="px-4 py-2 text-right">{concepto.cantidad} {concepto.unidad}</td>
                      <td className="px-4 py-2 text-right">${concepto.costoUnitario}</td>
                      <td className="px-4 py-2 text-right">${concepto.importe?.toLocaleString()}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          (concepto.avancePorcentaje || 0) >= 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {concepto.avancePorcentaje || 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'nominas':
        if (selectedNomina) {
          return (
            <NominaDetail
              nomina={selectedNomina}
              obra={obra}
              currentUser={currentUser}
              onBack={() => setSelectedNomina(null)}
              onValidar={onCambiarEstadoNomina ? (id) => onCambiarEstadoNomina(id, 'validada') : undefined}
              onAutorizar={onCambiarEstadoNomina ? (id) => onCambiarEstadoNomina(id, 'autorizada') : undefined}
              onPagar={onCambiarEstadoNomina ? (id) => onCambiarEstadoNomina(id, 'pagada') : undefined}
            />
          );
        }
        
        if (showNominaForm) {
          return (
            <NominaForm
              obraId={obra.id}
              obraName={obra.nombre}
              residenteName={currentUser.name}
              residenteId={currentUser.id}
              onSave={(data) => {
                onSaveNomina(data);
                setShowNominaForm(false);
              }}
              onCancel={() => setShowNominaForm(false)}
            />
          );
        }

        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Nóminas</h2>
                <p className="text-gray-600">{obra.nombre}</p>
              </div>
              <Button onClick={() => setShowNominaForm(true)} className="bg-blue-600">
                + Nueva Nómina
              </Button>
            </div>

            {nominasDeObra.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-lg text-center border-2 border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">No hay nóminas registradas</p>
                <Button onClick={() => setShowNominaForm(true)}>Crear Primera Nómina</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {nominasDeObra.map((nomina) => (
                  <div 
                    key={nomina.id} 
                    onClick={() => setSelectedNomina(nomina)}
                    className="bg-white p-4 rounded-lg shadow border hover:shadow-md cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold">Semana {nomina.numeroSemana || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{nomina.semanaDel} al {nomina.semanaAl}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${nomina.totalNomina?.toLocaleString('es-MX') || 0}</p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        nomina.estado === 'pagada' ? 'bg-green-100 text-green-800' :
                        nomina.estado === 'autorizada' ? 'bg-blue-100 text-blue-800' :
                        nomina.estado === 'validada' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {nomina.estado?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'cajachica':
        if (showCajaChicaForm) {
          return (
            <CajaChicaForm
              obraId={obra.id}
              obraName={obra.nombre}
              residenteName={currentUser.name}
              onSave={(data) => {
                onSaveCajaChica(data);
                setShowCajaChicaForm(false);
              }}
              onCancel={() => setShowCajaChicaForm(false)}
            />
          );
        }

        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Caja Chica</h2>
                <p className="text-gray-600">Gastos Indirectos - {obra.nombre}</p>
              </div>
              <Button onClick={() => setShowCajaChicaForm(true)} className="bg-green-600">
                + Nueva Semana
              </Button>
            </div>

            {cajasChica.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-lg text-center border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No hay registros de caja chica</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {cajasChica.map((caja) => (
                  <div key={caja.id} className="bg-white p-4 rounded-lg shadow border">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">Semana: {caja.semanaDel} al {caja.semanaAl}</p>
                        <p className="text-sm text-gray-600">Total Comprobado: ${caja.totalComprobado}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {caja.gastos.length} gastos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'avance':
        if (showAvanceForm) {
          return (
            <AvanceSemanalForm
              obra={obra}
              semanaNumero={(obra.semanaActualReporte || 0) + 1}
              onSave={(avance) => {
                onGuardarAvance(avance);
                setShowAvanceForm(false);
              }}
              onCancel={() => setShowAvanceForm(false)}
            />
          );
        }

        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Avance Físico</h2>
                <p className="text-gray-600">{obra.nombre}</p>
              </div>
              <Button onClick={() => setShowAvanceForm(true)} className="bg-indigo-600">
                Reportar Avance Semanal
              </Button>
            </div>

            {obra.registrosAvance && obra.registrosAvance.length > 0 ? (
              <div className="space-y-3">
                {obra.registrosAvance
                  .sort((a, b) => b.semana - a.semana)
                  .map((registro) => (
                    <div key={registro.semana} className="flex justify-between items-center p-4 bg-white rounded-lg shadow border">
                      <div>
                        <p className="font-semibold">Semana {registro.semana}</p>
                        <p className="text-sm text-gray-500">{registro.semanaDel} al {registro.semanaAl}</p>
                        {registro.notas && (
                          <p className="text-sm text-gray-600 mt-1">{registro.notas}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">+{registro.porcentajeEstaSemana}%</p>
                        <p className="text-sm text-gray-500">Acumulado: {registro.porcentajeAcumulado}%</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-8 rounded-lg text-center border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No hay registros de avance. Reporta la primera semana.</p>
              </div>
            )}
          </div>
        );

      case 'materiales':
  return (
    <MaterialesManager 
      obra={obra} 
      onGuardarRequisicion={(req) => {
        // Aquí conectas con tu backend/hook cuando lo tengas listo
        console.log('Requisición guardada:', req);
        toast.success('Requisición guardada. Pendiente de aprobación.');
      }}
    />
  );

      case 'equipos':
  return (
    <EquiposManager 
      obra={obra} 
      onGuardarEquipo={(eq) => {
        console.log('Equipo guardado:', eq);
        toast.success('Renta registrada. Se vinculará al avance físico.');
        // Aquí conectarás con tu backend: createEquipo(eq)
      }}
    />
  );

      case 'destajos':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Destajos</h2>
              <Button className="bg-amber-600">+ Nuevo Destajo</Button>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg text-center border-2 border-dashed border-gray-300">
              <Hammer className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Control de Destajos y Subcontratos</p>
              <p className="text-sm text-gray-400 mt-2">Integración con Excel "Carátula de Destajo" y "Desglose de Destajo"</p>
            </div>
          </div>
        );

      case 'documentos':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Documentos</h2>
              <Button>+ Subir Documento</Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {documentos.length === 0 ? (
                <div className="col-span-full bg-gray-50 p-8 rounded-lg text-center border-2 border-dashed border-gray-300">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No hay documentos subidos</p>
                </div>
              ) : (
                documentos.map((doc) => (
                  <div key={doc.id} className="p-4 border rounded-lg hover:shadow-md cursor-pointer bg-white">
                    <FileText className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="font-semibold text-sm truncate">{doc.nombre}</p>
                    <p className="text-xs text-gray-500">{doc.tipo}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      
      {/* Header Fijo */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver a Obras
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  {obra.nombre}
                </h1>
                <p className="text-sm text-gray-500">
                  {obra.ubicacion} • Residente: {obra.residenteName || 'Sin asignar'} • 
                  Inicio: {obra.fechaInicio}
                </p>
              </div>
            </div>
            
            {/* Botón Cerrar Semana (Solo para residentes y admin) */}
            {(currentUser.role === 'residente' || currentUser.role === 'admin') && (
              <Button 
                onClick={handleCerrarSemana}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                CERRAR SEMANA
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {filteredTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                      {tab.label}
                    </div>
                    {tab.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Widget de Progreso */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-sm mb-3">Avance del Proyecto</h3>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(obra.avanceFisicoGlobal || 0, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{obra.avanceFisicoGlobal || 0}% Físico</span>
                <span>{obra.avanceFinancieroGlobal || 0}% Financiero</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border min-h-[600px] p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
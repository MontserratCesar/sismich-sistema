import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { LoginForm } from '@/components/login/LoginForm';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { ResidenteDashboard } from '@/components/dashboard/ResidenteDashboard';
import { ContadoraDashboard } from '@/components/dashboard/ContadoraDashboard';
import { ObrasManager } from '@/components/obras/ObrasManager';
import { ObraDetail } from '@/components/obras/ObraDetail';
import { NominasManager } from '@/components/nominas/NominasManager';
import { NominaDetail } from '@/components/nominas/NominaDetail';
import { NominaForm } from '@/components/nominas/NominaForm';
import { CajaChicaForm } from '@/components/caja-chica/CajaChicaForm';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useObras } from '@/hooks/useObras';
import { useNominas } from '@/hooks/useNominas';
import { useCajaChica } from '@/hooks/useCajaChica';
import { useDocumentos } from '@/hooks/useDocumentos';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UsuariosManager } from '@/components/usuarios/UsuariosManager';  // <UsuariosManager ... />
import { PresupuestoForm } from '@/components/presupuesto/PresupuestoForm';
import type { User, Obra, Nomina, NominaEmpleado, UserRole, CajaChica, GastoCajaChica, PresupuestoObra } from '@/types';

function App() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { users, createUser, updateUser, deleteUser, resetPassword } = useUsers();
  const { obras, createObra, updateObra, deleteObra } = useObras();
  const { nominas, createNomina, updateNomina, deleteNomina, validarNomina, autorizarNomina, pagarNomina, getNominasByObra, getTotalPagadoByObra } = useNominas();
  
  const { documentos, uploadDocumento, deleteDocumento } = useDocumentos();
  
  // ✅ CORREGIDO: Solo dejé createCajaChica que es la que usarás
  const { createCajaChica } = useCajaChica();

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [selectedNomina, setSelectedNomina] = useState<Nomina | null>(null);
  const [showNominaForm, setShowNominaForm] = useState(false);
  const [showCajaChicaForm, setShowCajaChicaForm] = useState(false);
  const [showPresupuestoForm, setShowPresupuestoForm] = useState(false);

  const handleLogin = (username: string, password: string, role: UserRole): boolean => {
    const success = login(username, password, role);
    if (success) {
      toast.success('Bienvenido al sistema SISMICH');
    } else {
      toast.error('Credenciales incorrectas');
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    setCurrentView('dashboard');
    setSelectedObra(null);
    setSelectedNomina(null);
    toast.info('Sesión cerrada');
  };

  // User handlers
  const handleCreateUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    createUser(userData);
    toast.success('Usuario creado exitosamente');
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    updateUser(id, updates);
    toast.success('Usuario actualizado');
  };

  const handleDeleteUser = (id: string) => {
    deleteUser(id);
    toast.success('Usuario eliminado');
  };

  const handleResetPassword = (id: string, newPassword: string) => {
    resetPassword(id, newPassword);
    toast.success('Contraseña restablecida');
  };

  // Obra handlers
  const handleCreateObra = (obraData: Parameters<typeof createObra>[0]) => {
    createObra(obraData);
    toast.success('Obra creada exitosamente');
  };

  const handleUpdateObra = (id: string, updates: Parameters<typeof updateObra>[1]) => {
    updateObra(id, updates);
    toast.success('Obra actualizada');
  };

  const handleDeleteObra = (id: string) => {
    deleteObra(id);
    toast.success('Obra eliminada');
  };
    // HANDLERS EXISTENTES 
  
  // ➕ NUEVO HANDLER PARA GUARDAR NÓMINA:
  const handleSaveNomina = (nominaData: any) => {
    const nuevaNomina = createNomina(nominaData);
    
    // Si se pagó inmediatamente o quieres actualizar la obra:
    if (nuevaNomina.estado === 'pagada' && nuevaNomina.obraId) {
      const obra = obras.find(o => o.id === nuevaNomina.obraId);
      if (obra) {
        // Calcular nuevo total de nóminas pagadas de esta obra
        const nominasPagadas = nominas.filter(n => 
          n.obraId === obra.id && n.estado === 'pagada'
        );
        const totalManoObra = nominasPagadas.reduce((sum, n) => sum + n.totalNomina, 0);
        
        // Actualizar la obra
        updateObra(obra.id, {
  ...obra,
  gastoRealManoObra: totalManoObra,
  gastoTotalReal: totalManoObra + obra.gastoRealMateriales + obra.gastoRealEquipo,
  avanceFinancieroGlobal: obra.presupuesto?.totalPresupuesto > 0 
  ? ((totalManoObra + (obra.gastoRealMateriales || 0) + (obra.gastoRealEquipo || 0)) / obra.presupuesto.totalPresupuesto) * 100 
  : 0
});
      }
    }
    
    setShowNominaForm(false);
    toast.success('Nómina guardada exitosamente');
  };

  // ➕ NUEVO HANDLER PARA CAMBIAR ESTADO DE NÓMINA:
  const handleCambiarEstadoNomina = (id: string, nuevoEstado: Nomina['estado']) => {
    updateNomina(id, { estado: nuevoEstado });
    
    // Si se marca como pagada, actualizar la obra automáticamente
    if (nuevoEstado === 'pagada') {
      const nomina = nominas.find(n => n.id === id);
      if (nomina && nomina.obraId) {
        const obra = obras.find(o => o.id === nomina.obraId);
        if (obra) {
          const totalPagado = getTotalPagadoByObra(nomina.obraId);
          updateObra(nomina.obraId, {
            gastoRealManoObra: totalPagado,
            gastoTotalReal: totalPagado + obra.gastoRealMateriales + obra.gastoRealEquipo
          });
        }
      }
    }
    
    toast.success(`Nómina ${nuevoEstado}`);
  };
  
  // Nomina handlers
  const handleCreateNomina = (nominaData: Parameters<typeof createNomina>[0]) => {
    createNomina(nominaData);
    toast.success('Nómina creada exitosamente');
  };

  const handleUpdateNomina = (id: string, updates: Parameters<typeof updateNomina>[1]) => {
    updateNomina(id, updates);
    toast.success('Nómina actualizada');
  };

  const handleDeleteNomina = (id: string) => {
    deleteNomina(id);
    toast.success('Nómina eliminada');
  };

  const handleValidarNomina = (id: string) => {
    validarNomina(id);
    toast.success('Nómina validada');
  };

  const handleAutorizarNomina = (id: string) => {
    autorizarNomina(id);
    toast.success('Nómina autorizada');
  };

  const handlePagarNomina = (id: string) => {
  const nomina = pagarNomina(id);
  toast.success('Pago registrado exitosamente');
  
  // ACTUALIZAR LA OBRA CON EL NUEVO TOTAL
  if (nomina) {
    const nominasDeObra = nominas.filter(n => 
      n.obraId === nomina.obraId && 
      (n.estado === 'pagada' || n.estado === 'autorizada')
    );
    const totalManoObra = nominasDeObra.reduce((sum, n) => sum + n.totalNomina, 0);
    
    // Actualizar la obra con el nuevo total de mano de obra
    updateObra(nomina.obraId, { 
      totalManoObra: totalManoObra 
    });
  }
};
// Handle para presupuesto
const handleSavePresupuesto = (presupuesto: PresupuestoObra) => {
  if (selectedObra) {
    updateObra(selectedObra.id, { 
      presupuesto,
      presupuestoTotal: presupuesto.totalPresupuesto 
    });
    toast.success('Presupuesto guardado exitosamente');
    setShowPresupuestoForm(false);
  }
};

  // Documento handlers
  const handleUploadDocumento = async (obraId: string, tipo: Parameters<typeof uploadDocumento>[1], nombre: string, file: File) => {
    await uploadDocumento(obraId, tipo, nombre, file, user?.name || '');
    toast.success('Documento subido exitosamente');
  };

  const handleDeleteDocumento = (id: string) => {
    deleteDocumento(id);
    toast.success('Documento eliminado');
  };

  // View handlers
  const handleViewObra = (obra: Obra) => {
    setSelectedObra(obra);
  };

  const handleBackFromObra = () => {
    setSelectedObra(null);
  };

  const handleViewNomina = (nomina: Nomina) => {
    setSelectedNomina(nomina);
  };

  const handleBackFromNomina = () => {
    setSelectedNomina(null);
  };

  const handleCreateNominaFromDashboard = () => {
    setCurrentView('nominas');
  };

  // Render content based on current view
  const renderContent = () => {
    if (!user) return null;

    // Obra Detail View
    if (selectedObra && currentView === 'obras') {
      return (
        <ObraDetail
          obra={selectedObra}
          nominas={nominas}
          documentos={documentos}
          users={users}
          currentUser={user}
          onBack={handleBackFromObra}
          onUploadDocumento={handleUploadDocumento}
          onDeleteDocumento={handleDeleteDocumento}
          onViewNomina={handleViewNomina}
        />
      );
    }

    // Nomina Detail View
    if (selectedNomina) {
      return (
        <NominaDetail
          nomina={selectedNomina}
          obra={obras.find(o => o.id === selectedNomina.obraId)}
          currentUser={user}
          onBack={handleBackFromNomina}
          onValidar={handleValidarNomina}
          onAutorizar={handleAutorizarNomina}
          onPagar={handlePagarNomina}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        if (user.role === 'admin') {
          return <AdminDashboard obras={obras} nominas={nominas} users={users} />;
        } else if (user.role === 'residente') {
          return (
            <ResidenteDashboard
              user={user}
              obras={obras}
              nominas={nominas}
              onViewObra={(obraId) => {
                const obra = obras.find(o => o.id === obraId);
                if (obra) handleViewObra(obra);
              }}
              onCreateNomina={handleCreateNominaFromDashboard}
            />
          );
        } else if (user.role === 'contadora') {
          return (
            <ContadoraDashboard
              obras={obras}
              nominas={nominas}
              onViewNomina={(nominaId) => {
                const nomina = nominas.find(n => n.id === nominaId);
                if (nomina) handleViewNomina(nomina);
              }}
            />
          );
        }
        return null;

      case 'obras':
        return (
          <ObrasManager
            obras={obras}
            users={users}
            currentUser={user}
            onCreate={handleCreateObra}
            onUpdate={handleUpdateObra}
            onDelete={handleDeleteObra}
            onViewDetail={handleViewObra}
          />
        );

        case 'nominas':
  // Si no hay obra seleccionada, mostrar selector
  if (!selectedObra) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Gestión de Nóminas</h2>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <p className="mb-4 text-gray-600">Selecciona una obra para ver y crear nóminas:</p>
          <select 
            onChange={(e) => {
              const obra = obras.find(o => o.id === e.target.value);
              if (obra) {
                setSelectedObra(obra);
                toast.success(`Obra seleccionada: ${obra.nombre}`);
              }
            }}
            className="w-full border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="" disabled>-- Seleccionar obra --</option>
            {obras.map(obra => (
              <option key={obra.id} value={obra.id}>
                {obra.nombre} ({obra.ubicacion})
              </option>
            ))}
          </select>
          
          {obras.length === 0 && (
            <p className="mt-4 text-red-500 text-sm">
              No hay obras registradas. Primero crea una obra en el menú "Obras".
            </p>
          )}
        </div>
      </div>
    );
  }

  // Si HAY obra seleccionada pero NO estamos en el formulario ni viendo detalle
  // Mostramos la vista intermedia con el botón de crear
  if (!showNominaForm && !selectedNomina) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Nóminas de la Obra</h2>
            <p className="text-gray-600">{selectedObra.nombre}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setSelectedObra(null)}  // ← BOTÓN PARA CAMBIAR DE OBRA
            >
              Cambiar Obra
            </Button>
            <Button 
              onClick={() => setShowNominaForm(true)} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Nueva Nómina
            </Button>
          </div>
        </div>

        {/* Si hay nóminas existentes, mostrar lista simple */}
        {nominas.filter(n => n.obraId === selectedObra.id).length > 0 ? (
          <div className="space-y-2">
            {nominas
              .filter(n => n.obraId === selectedObra.id)
              .map(nomina => (
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
                      {nomina.estado?.toUpperCase() || 'PENDIENTE'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">No hay nóminas registradas para esta obra</p>
            <Button onClick={() => setShowNominaForm(true)} className="bg-blue-600">
              <Plus className="w-4 h-4 mr-2" /> Crear Primera Nómina
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Si estamos creando una nómina nueva (formulario)
  if (showNominaForm && selectedObra) {
    return (
      <NominaForm
        obraId={selectedObra.id}
        obraName={selectedObra.nombre}
        residenteName={user?.name || ''}
        residenteId={user?.id || ''}
        onSave={handleSaveNomina}
        onCancel={() => setShowNominaForm(false)}
      />
    );
  }
  
  // Si estamos viendo el detalle de una nómina específica
  if (selectedNomina) {
    return (
      <NominaDetail
        nomina={selectedNomina}
        obra={obras.find(o => o.id === selectedNomina.obraId)}
        currentUser={user}
        onBack={() => setSelectedNomina(null)}
        onValidar={handleValidarNomina}
        onAutorizar={handleAutorizarNomina}
        onPagar={handlePagarNomina}
      />
    );
  }
        
     case 'caja-chica':
  // Si no hay obra seleccionada, mostrar selector primero (igual que nóminas)
  if (!selectedObra) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Caja Chica - Gastos Indirectos</h2>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <p className="mb-4 text-gray-600">Selecciona una obra para registrar gastos:</p>
          <select 
            onChange={(e) => {
              const obra = obras.find(o => o.id === e.target.value);
              if (obra) {
                setSelectedObra(obra);
                toast.success(`Obra seleccionada: ${obra.nombre}`);
              }
            }}
            className="w-full border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-green-500"
            defaultValue=""
          >
            <option value="" disabled>-- Seleccionar obra --</option>
            {obras.map(obra => (
              <option key={obra.id} value={obra.id}>
                {obra.nombre} ({obra.ubicacion})
              </option>
            ))}
          </select>
          
          {obras.length === 0 && (
            <p className="mt-4 text-red-500 text-sm">
              No hay obras registradas. Primero crea una obra en el menú "Obras".
            </p>
          )}
        </div>
      </div>
    );
  }

  // Si HAY obra seleccionada pero NO estamos en el formulario
  if (!showCajaChicaForm) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Caja Chica</h2>
            <p className="text-gray-600">{selectedObra.nombre}</p>
          </div>
          <Button 
            onClick={() => setShowCajaChicaForm(true)} 
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Nueva Semana de Gastos
          </Button>
        </div>
        
        {/* Aquí puedes agregar lista de cajas chicas existentes */}
        <div className="bg-gray-50 p-8 rounded-lg text-center border-2 border-dashed border-gray-300">
          <p className="text-gray-500">Selecciona "Nueva Semana" para registrar gastos indirectos</p>
        </div>
      </div>
    );
  }

  // Mostrar formulario
  return (
    <CajaChicaForm
      obraId={selectedObra.id}
      obraName={selectedObra.nombre}
      residenteName={user?.name || ''}
      onSave={(data) => {
        createCajaChica(data);
        setShowCajaChicaForm(false);
        toast.success('Caja chica registrada');
      }}
      onCancel={() => setShowCajaChicaForm(false)}
    />
  );

  case 'presupuesto':
  // 1. Si no hay obra seleccionada, mostrar selector
  if (!selectedObra) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Presupuesto de Obra</h2>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <p className="mb-4 text-gray-600">Selecciona una obra para ver o crear el presupuesto:</p>
          <select 
            onChange={(e) => {
              const obra = obras.find(o => o.id === e.target.value);
              if (obra) {
                setSelectedObra(obra);
                setShowPresupuestoForm(false); // Resetear estado
                toast.success(`Obra seleccionada: ${obra.nombre}`);
              }
            }}
            className="w-full border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="" disabled>-- Seleccionar obra --</option>
            {obras.map(obra => (
              <option key={obra.id} value={obra.id}>
                {obra.nombre} ({obra.ubicacion})
              </option>
            ))}
          </select>
          
          {obras.length === 0 && (
            <p className="mt-4 text-red-500 text-sm">
              No hay obras registradas. Primero crea una obra en el menú "Obras".
            </p>
          )}
        </div>
      </div>
    );
  }

  // 2. Si HAY obra seleccionada y queremos editar/crear (showPresupuestoForm es true O no existe presupuesto)
  // IMPORTANTE: Esta condición debe ir ANTES que la vista de resumen
  if (showPresupuestoForm === true || !selectedObra.presupuesto || Object.keys(selectedObra.presupuesto || {}).length === 0) {
    return (
      <PresupuestoForm
        obraId={selectedObra.id}
        obraName={selectedObra.nombre}
        presupuestoExistente={selectedObra.presupuesto}
        onSave={handleSavePresupuesto}
        onCancel={() => {
          setShowPresupuestoForm(false);
          // Si cancelamos y no hay presupuesto guardado, volver al selector
          if (!selectedObra.presupuesto || Object.keys(selectedObra.presupuesto || {}).length === 0) {
            setSelectedObra(null);
          }
        }}
      />
    );
  }

  // 3. Si HAY obra seleccionada y YA TIENE presupuesto guardado - mostrar resumen
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Presupuesto de la Obra</h2>
          <p className="text-gray-600">{selectedObra.nombre}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => {
              setSelectedObra(null);
              setShowPresupuestoForm(false);
            }}
          >
            Cambiar Obra
          </Button>
          <Button 
            onClick={() => setShowPresupuestoForm(true)} 
            className="bg-blue-600"
          >
            {selectedObra.presupuesto ? 'Editar Presupuesto' : 'Crear Presupuesto'}
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {selectedObra.presupuesto && selectedObra.presupuesto.totalPresupuesto > 0 ? (
          <div className="space-y-6">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Materiales</p>
                <p className="text-xl font-bold text-blue-900">
                  ${(selectedObra.presupuesto.sumaMateriales || 0).toLocaleString('es-MX')}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Mano de Obra</p>
                <p className="text-xl font-bold text-orange-900">
                  ${(selectedObra.presupuesto.sumaManoObra || 0).toLocaleString('es-MX')}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Equipo</p>
                <p className="text-xl font-bold text-purple-900">
                  ${(selectedObra.presupuesto.sumaEquipo || 0).toLocaleString('es-MX')}
                </p>
              </div>
              <div className="bg-gray-900 text-white p-4 rounded-lg">
                <p className="text-sm text-gray-300 mb-1">Total Presupuesto</p>
                <p className="text-2xl font-bold">
                  ${(selectedObra.presupuesto.totalPresupuesto || 0).toLocaleString('es-MX')}
                </p>
              </div>
            </div>
            
            {/* Detalle adicional */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Desglose</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Costo Directo:</span>
                  <span className="font-mono">${(selectedObra.presupuesto.costoDirecto || 0).toLocaleString('es-MX')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Indirectos ({selectedObra.presupuesto.indirectosPorcentaje || 10}%):</span>
                  <span className="font-mono">${(selectedObra.presupuesto.indirectos || 0).toLocaleString('es-MX')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Utilidad ({selectedObra.presupuesto.utilidadPorcentaje || 8}%):</span>
                  <span className="font-mono">${(selectedObra.presupuesto.utilidadMonto || 0).toLocaleString('es-MX')}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Esta obra no tiene presupuesto registrado.</p>
            <Button 
              onClick={() => setShowPresupuestoForm(true)} 
              className="bg-blue-600"
            >
              Crear Presupuesto Ahora
            </Button>
          </div>
        )}
      </div>
    </div>
  );

      case 'usuarios':
        if (user.role === 'admin') {
          return (
            <UsuariosManager
              users={users}
              onCreate={handleCreateUser}
              onUpdate={handleUpdateUser}
              onDelete={handleDeleteUser}
              onResetPassword={handleResetPassword}
            />
          );
        }
        return null;

      case 'documentos':
        // Redirect to obras view for document management
        setCurrentView('obras');
        return null;

      case 'configuracion':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuración</h2>
            <p className="text-gray-500">Configuración del sistema (próximamente)</p>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginForm onLogin={handleLogin} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <>
      <MainLayout
        user={user!}
        onLogout={handleLogout}
        currentView={currentView}
        onViewChange={setCurrentView}
      >
        {renderContent()}
      </MainLayout>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;

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
import type { User, Obra, Nomina, NominaEmpleado, UserRole, CajaChica, GastoCajaChica, PresupuestoObra, RegistroAvanceSemanal } from '@/types';
import { AvanceSemanalForm } from '@/components/avance/AvanceSemanalForm';

function App() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { users, createUser, updateUser, deleteUser, resetPassword } = useUsers();
  const { obras, createObra, updateObra, deleteObra, agregarAvanceSemanal } = useObras();
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
  const [showAvanceForm, setShowAvanceForm] = useState(false);

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

const handleGuardarAvance = (avance: RegistroAvanceSemanal) => {
  if (selectedObra) {
    agregarAvanceSemanal(selectedObra.id, avance);
    toast.success(`Avance semana ${avance.semana} guardado`);
    setShowAvanceForm(false);
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
  // DEBUG: Ver qué está pasando (puedes quitar después)
  console.log('Presupuesto view - selectedObra:', selectedObra?.nombre);
  console.log('Presupuesto view - showPresupuestoForm:', showPresupuestoForm);
  console.log('Presupuesto view - has presupuesto:', !!selectedObra?.presupuesto?.totalPresupuesto);

  // 1. Sin obra seleccionada = Selector
  if (!selectedObra) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Presupuesto de Obra</h2>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <p className="mb-4 text-gray-600">Selecciona una obra:</p>
          <select 
            onChange={(e) => {
              const obra = obras.find(o => o.id === e.target.value);
              if (obra) {
                console.log('Seleccionando obra:', obra.nombre);
                setSelectedObra(obra);
                setShowPresupuestoForm(false);
              }
            }}
            className="w-full border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="" disabled>-- Seleccionar obra --</option>
            {obras.map(obra => (
              <option key={obra.id} value={obra.id}>
                {obra.nombre}
              </option>
            ))}
          </select>
          
          {obras.length === 0 && (
            <p className="mt-4 text-red-500 text-sm">No hay obras registradas.</p>
          )}
        </div>
      </div>
    );
  }

  // 2. Con obra seleccionada - Verificar si mostrar formulario o resumen
  const tienePresupuesto = selectedObra.presupuesto && selectedObra.presupuesto.totalPresupuesto > 0;
  const quiereEditar = showPresupuestoForm === true;

  // MOSTRAR FORMULARIO si: quiere editar O no tiene presupuesto
  if (quiereEditar || !tienePresupuesto) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {tienePresupuesto ? 'Editar Presupuesto' : 'Crear Presupuesto'}
            </h2>
            <p className="text-gray-600">{selectedObra.nombre}</p>
          </div>
          {tienePresupuesto && (
            <Button 
              variant="outline"
              onClick={() => setShowPresupuestoForm(false)}
            >
              Cancelar Edición
            </Button>
          )}
        </div>
        
        <PresupuestoForm
          obraId={selectedObra.id}
          obraName={selectedObra.nombre}
          presupuestoExistente={tienePresupuesto ? selectedObra.presupuesto : undefined}
          onSave={(presupuesto) => {
            handleSavePresupuesto(presupuesto);
            setShowPresupuestoForm(false);
          }}
          onCancel={() => {
            setShowPresupuestoForm(false);
            if (!tienePresupuesto) {
              setSelectedObra(null);
            }
          }}
        />
      </div>
    );
  }

  // 3. MOSTRAR RESUMEN (solo si tiene presupuesto y no quiere editar)
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
            Editar Presupuesto
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Materiales</p>
            <p className="text-xl font-bold">${(selectedObra.presupuesto?.sumaMateriales || 0).toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded">
            <p className="text-sm text-gray-600">Mano de Obra</p>
            <p className="text-xl font-bold">${(selectedObra.presupuesto?.sumaManoObra || 0).toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-gray-600">Equipo</p>
            <p className="text-xl font-bold">${(selectedObra.presupuesto?.sumaEquipo || 0).toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 text-white p-4 rounded">
            <p className="text-sm text-gray-300">Total</p>
            <p className="text-2xl font-bold">${(selectedObra.presupuesto?.totalPresupuesto || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );

  case 'avance':
  if (!selectedObra) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Reporte de Avance Físico</h2>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <p className="mb-4 text-gray-600">Selecciona una obra para reportar avance:</p>
          <select 
            onChange={(e) => {
              const obra = obras.find(o => o.id === e.target.value);
              if (obra) {
                setSelectedObra(obra);
                setShowAvanceForm(false);
              }
            }}
            className="w-full border border-gray-300 p-3 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500"
            defaultValue=""
          >
            <option value="" disabled>-- Seleccionar obra --</option>
            {obras.map(obra => (
              <option key={obra.id} value={obra.id}>
                {obra.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (showAvanceForm) {
    const semanaActual = (selectedObra.semanaActualReporte || 0) + 1;
    return (
      <AvanceSemanalForm
        obra={selectedObra}
        semanaNumero={semanaActual}
        onSave={handleGuardarAvance}
        onCancel={() => setShowAvanceForm(false)}
      />
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Avance Físico</h2>
          <p className="text-gray-600">{selectedObra.nombre}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setSelectedObra(null)}
          >
            Cambiar Obra
          </Button>
          <Button 
            onClick={() => setShowAvanceForm(true)} 
            className="bg-indigo-600"
          >
            Reportar Avance Semanal
          </Button>
        </div>
      </div>

      {/* Mostrar historial de avances */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-4">Historial de Avances</h3>
        {selectedObra.registrosAvance && selectedObra.registrosAvance.length > 0 ? (
          <div className="space-y-3">
            {selectedObra.registrosAvance
              .sort((a, b) => b.semana - a.semana)
              .map((registro) => (
                <div key={registro.semana} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
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
          <p className="text-gray-500 text-center py-8">No hay registros de avance. Reporta la primera semana.</p>
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

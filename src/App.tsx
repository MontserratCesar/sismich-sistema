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
import type { User, Obra, Nomina, NominaEmpleado, UserRole, CajaChica, GastoCajaChica, PresupuestoObra, RegistroAvanceSemanal, TipoPresupuesto, VersionPresupuesto } from '@/types';
import { AvanceSemanalForm } from '@/components/avance/AvanceSemanalForm';
import { ObraWorkspace } from '@/components/obras/ObraWorkspace';

function App() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { users, createUser, updateUser, deleteUser, resetPassword } = useUsers();
  const { obras, loading: obrasLoading, createObra, updateObra, registrarAvanceSemanal, actualizarGastoReal, getObraById, deleteObra } = useObras();
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
  const handleCreateObra = async (obraData: Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createObra({
        nombre: obraData.nombre,
        ubicacion: obraData.ubicacion,
        ambito: obraData.ambito,
        fechaInicio: obraData.fechaInicio,
        fechaTermino: obraData.fechaTermino,
        tipoRecurso: obraData.tipoRecurso,
        residenteId: obraData.residenteId,
        residenteName: obraData.residenteName,
      });
      toast.success('Obra creada exitosamente');
    } catch (error) {
      toast.error('Error al crear la obra');
    }
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

  const handlePagarNomina = (id: string, fechaPago?: string, pagadoPor?: string) => {
  // 1. Obtener la nómina actual
  const nomina = nominas.find(n => n.id === id);
  if (!nomina) return;

  // 2. Actualizar la nómina con estado pagado + metadata
  const updates: Partial<Nomina> = {
    estado: 'pagada',
    pagadaAt: fechaPago || new Date().toISOString(),
    pagoRegistradoPor: pagadoPor || user?.name || 'Sistema',
  };
  
  updateNomina(id, updates);
  
  toast.success(`Pago de ${nomina.obraName} - Semana ${nomina.numeroSemana} registrado correctamente`);

  // 3. ACTUALIZAR LA OBRA - Acumular gasto de mano de obra
  if (nomina.obraId) {
    const obra = obras.find(o => o.id === nomina.obraId);
    if (obra) {
      // Calcular nuevo total de mano de obra pagada de esta obra
      const nominasPagadasDeObra = nominas.filter(n => 
        n.obraId === obra.id && 
        (n.estado === 'pagada' || (n.id === id)) // Incluir la actual que acabamos de marcar
      );
      
      const totalManoObraPagada = nominasPagadasDeObra.reduce((sum, n) => {
        // Si es la nómina actual, tomemos el total actual, si no, el de la nómina
        const monto = (n.id === id) ? nomina.totalNomina : n.totalNomina;
        return sum + monto;
      }, 0);
      
      // Calcular gasto total real (mano obra + materiales + equipo)
      const gastoTotalReal = totalManoObraPagada + 
        (obra.gastoRealMateriales || 0) + 
        (obra.gastoRealEquipo || 0);
      
      // Calcular avance financiero global
      const avanceFinanciero = obra.presupuesto?.totalPresupuesto 
        ? (gastoTotalReal / obra.presupuesto.totalPresupuesto) * 100 
        : 0;

      // Actualizar la obra
      updateObra(obra.id, {
        gastoRealManoObra: totalManoObraPagada,
        gastoTotalReal: gastoTotalReal,
        avanceFinancieroGlobal: parseFloat(avanceFinanciero.toFixed(2))
      });
      
      console.log(`Obra ${obra.nombre} actualizada:`, {
        manoObra: totalManoObraPagada,
        totalGastado: gastoTotalReal,
        avanceFinanciero: avanceFinanciero.toFixed(2) + '%'
      });
    }
  }
  
  // 4. Limpiar selección si es necesario (opcional)
   setSelectedNomina(null); 
};
  
// Handle para presupuesto (nueva firma: tipo + versión)
const handleSavePresupuesto = (tipo: TipoPresupuesto, version: VersionPresupuesto) => {
  if (selectedObra) {
    const presupuestosActuales = selectedObra.presupuestos || {};
    const newPresupuestos = { ...presupuestosActuales, [tipo]: version };
    updateObra(selectedObra.id, { presupuestos: newPresupuestos });
    // Actualizar selectedObra para que ObraWorkspace refleje el cambio inmediatamente
    setSelectedObra(prev => prev ? { ...prev, presupuestos: newPresupuestos } : null);
    toast.success(`Presupuesto ${tipo} guardado exitosamente`);
  }
};

const handleGuardarAvance = (avance: RegistroAvanceSemanal) => {
  if (selectedObra) {
    registrarAvanceSemanal(
      selectedObra.id,
      avance.id || '',
      {
        semanaDel: avance.semanaDel || '',
        semanaAl: avance.semanaAl || '',
        numeroSemana: avance.numeroSemana || 1,
        cantidadEjecutada: avance.cantidadEjecutada || 0,
        notas: avance.notas,
      },
      user?.name || 'Sistema'
    );
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
  setCurrentView('obra-workspace'); // <-- NUEVA VISTA
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
          return ( 
          <AdminDashboard 
            obras={obras}
            nominas={nominas}
            users={users}
            onViewObra={(obraId) => {
              const obra = obras.find(o => o.id === obraId);
              if (obra) {
                setSelectedObra(obra);
                setCurrentView('obra-workspace');
              }
            }}
            onViewNomina={(nominaId) => {
              const nomina = nominas.find(n => n.id === nominaId);
              if (nomina) {
                setSelectedNomina(nomina);
              }
            }}
            />
          );

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
  // FIX: Filtrar obras según rol
  const obrasVisibles = user.role === 'residente' 
    ? obras.filter(o => o.residenteId === user.id)
    : obras; // Admin y Contadora ven TODO

  return (
    <ObrasManager
      obras={obrasVisibles}
      users={users}
      currentUser={user}
      onCreate={handleCreateObra}
      onUpdate={handleUpdateObra}
      onDelete={handleDeleteObra}
      onViewDetail={handleViewObra}
    />
  );

        case 'obra-workspace':
  if (!selectedObra) return null; // o redirigir a 'obras'
  return (
    <ObraWorkspace
      obra={selectedObra}
      currentUser={user}
      onBack={() => {
        setSelectedObra(null);
        setCurrentView('obras');
      }}
      nominas={nominas}
      cajasChica={[]} // <-- Aquí conecta tu hook useCajaChica().cajasChica o similar
      documentos={documentos}
      onSaveNomina={handleSaveNomina}
      onSaveCajaChica={(data) => {
        createCajaChica(data);
        toast.success('Caja chica guardada');
      }}
      onSavePresupuesto={handleSavePresupuesto}
      onGuardarAvance={handleGuardarAvance}
      onCambiarEstadoNomina={handleCambiarEstadoNomina}
    />
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
        currentObraName={selectedObra?.nombre}
      >
        {renderContent()}
      </MainLayout>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;

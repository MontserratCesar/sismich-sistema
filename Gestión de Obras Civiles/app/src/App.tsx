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
import type { User, Obra, Nomina, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function App() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const { users, createUser, updateUser, deleteUser, resetPassword } = useUsers();
  const { obras, createObra, updateObra, deleteObra } = useObras();
  
  const { nominas, createNomina, updateNomina, deleteNomina, validarNomina, autorizarNomina, pagarNomina } = useNominas();
  
  const { documentos, uploadDocumento, deleteDocumento } = useDocumentos();
  
  // ✅ CORREGIDO: Solo dejé createCajaChica que es la que usarás
  const { createCajaChica } = useCajaChica();

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [selectedNomina, setSelectedNomina] = useState<Nomina | null>(null);
  const [showNominaForm, setShowNominaForm] = useState(false);
  const [showCajaChicaForm, setShowCajaChicaForm] = useState(false);

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
          avanceFinancieroGlobal: obra.presupuesto.totalPresupuesto > 0 
            ? ((totalManoObra + obra.gastoRealMateriales + obra.gastoRealEquipo) / obra.presupuesto.totalPresupuesto) * 100 
            : 0
        });
      }
    }
    
    setShowNominaForm(false);
    toast.success('Nómina guardada exitosamente');
  };

  // ➕ NUEVO HANDLER PARA CAMBIAR ESTADO DE NÓMINA:
  const handleCambiarEstadoNomina = (id: string, nuevoEstado: Nomina['estado']) => {
    cambiarEstado(id, nuevoEstado, user?.name || '');
    
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
    if (selectedObra) {
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
        // Si estamos creando una nómina nueva (formulario)
        if (showNominaForm && selectedObra) {
          return (
            <NominaForm
              obraId={selectedObra.id}
              obraName={selectedObra.nombre}
              residenteName={user?.name || ''}
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
        
        // Vista por defecto: Lista de nóminas
        return (
          <NominasManager
            nominas={nominas}
            obras={obras}
            users={users}
            currentUser={user}
            onCreate={() => {
              // Verificar que haya una obra seleccionada
              if (!selectedObra) {
                toast.error('Primero selecciona una obra desde el menú Obras');
                setCurrentView('obras');
                return;
              }
              setShowNominaForm(true);
            }}
            onUpdate={handleUpdateNomina}
            onDelete={handleDeleteNomina}
            onValidar={handleValidarNomina}
            onAutorizar={handleAutorizarNomina}
            onPagar={handlePagarNomina}
            onViewDetail={(nomina) => setSelectedNomina(nomina)}
          />
        );
        
        case 'caja-chica':
  if (showCajaChicaForm && selectedObra) {
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
  }
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Caja Chica - Gastos Indirectos</h2>
      <Button onClick={() => setShowCajaChicaForm(true)} className="bg-green-600">
        <Plus className="w-4 h-4 mr-2" /> Nueva Semana de Gastos
      </Button>
      {/* Aquí irá la lista de cajas chicas */}
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

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  HardHat,
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Bell,
  User,
} from 'lucide-react';
import type { User as UserType, UserRole } from '@/types';

interface MainLayoutProps {
  user: UserType;
  onLogout: () => void;
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'residente', 'contadora'] },
  { id: 'obras', label: 'Obras', icon: Building2, roles: ['admin', 'residente'] },
  { id: 'nominas', label: 'Nóminas', icon: DollarSign, roles: ['admin', 'residente', 'contadora'], badge: 0 },
  { id: 'documentos', label: 'Documentos', icon: FileText, roles: ['admin', 'residente', 'contadora'] },
  { id: 'usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
  { id: 'configuracion', label: 'Configuración', icon: Settings, roles: ['admin'] },
];

export function MainLayout({ user, onLogout, children, currentView, onViewChange }: MainLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* HEADER CON LOGO Y LOGOUT DEBAJO */}
      <div className="p-6 border-b border-amber-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">SISMICH</h1>
            <p className="text-xs text-gray-500">Gestión de Obras</p>
          </div>
        </div>
        
        {/* BOTÓN CERRAR SESIÓN DEBAJO DEL LOGO */}
        <Button
          variant="outline"
          size="sm"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs"
          onClick={onLogout}
        >
          <LogOut className="w-3 h-3 mr-2" />
          Cerrar Sesión
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                currentView === item.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200'
                  : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'text-gray-400 group-hover:text-amber-600'}`} />
              <span className="font-medium flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {currentView === item.id && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </nav>
      </ScrollArea>

      {/* FOOTER SOLO CON INFO DEL USUARIO (SIN LOGOUT) */}
      <div className="p-4 border-t border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-amber-100 shadow-xl shadow-amber-100/20 fixed h-full z-10">
        <NavContent />
      </aside>

      {/* Sidebar Mobile */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 bg-white shadow-lg border border-gray-200"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-72 p-0 border-amber-100">
          <NavContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
            <h2 className="text-xl font-bold text-gray-900 capitalize">
              {navItems.find(i => i.id === currentView)?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  User,
  Shield,
  HardHat,
  Calculator,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import type { User as UserType, UserRole } from '@/types';

interface UsuariosManagerProps {
  users: UserType[];
  onCreate: (user: Omit<UserType, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, user: Partial<UserType>) => void;
  onDelete: (id: string) => void;
  onResetPassword: (id: string, newPassword: string) => void;
}

const emptyUser: Omit<UserType, 'id' | 'createdAt'> = {
  username: '',
  password: '',
  role: 'residente',
  name: '',
  email: '',
  phone: '',
  isActive: true,
};

export function UsuariosManager({ users, onCreate, onUpdate, onDelete, onResetPassword }: UsuariosManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [resetUserId, setResetUserId] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(emptyUser);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const usersByRole = {
    admin: filteredUsers.filter(u => u.role === 'admin'),
    residente: filteredUsers.filter(u => u.role === 'residente'),
    contadora: filteredUsers.filter(u => u.role === 'contadora'),
  };

  const handleOpenDialog = (user?: UserType) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        password: '', // No mostrar password actual
        role: user.role,
        name: user.name,
        email: user.email || '',
        phone: user.phone || '',
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData(emptyUser);
    }
    setIsDialogOpen(true);
  };

  const handleOpenResetDialog = (userId: string) => {
    setResetUserId(userId);
    setNewPassword('');
    setIsResetDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingUser) {
      const updates: Partial<UserType> = { ...formData };
      if (!formData.password) {
        delete (updates as any).password;
      }
      onUpdate(editingUser.id, updates);
    } else {
      onCreate(formData);
    }
    setIsDialogOpen(false);
    setFormData(emptyUser);
    setEditingUser(null);
  };

  const handleResetPassword = () => {
    if (newPassword && resetUserId) {
      onResetPassword(resetUserId, newPassword);
      setIsResetDialogOpen(false);
      setNewPassword('');
      setResetUserId('');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      onDelete(id);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'residente': return <HardHat className="w-4 h-4" />;
      case 'contadora': return <Calculator className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'residente': return 'Residente';
      case 'contadora': return 'Contadora';
    }
  };

  const UserCard = ({ user }: { user: UserType }) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              user.role === 'admin' ? 'bg-purple-100' :
              user.role === 'residente' ? 'bg-amber-100' :
              'bg-blue-100'
            }`}>
              {getRoleIcon(user.role)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">{user.name}</h3>
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">@{user.username}</p>
              <p className="text-sm text-amber-600 font-medium">{getRoleLabel(user.role)}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleOpenResetDialog(user.id)}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(user.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
          {user.email && <p>Email: {user.email}</p>}
          {user.phone && <p>Tel: {user.phone}</p>}
          <p>Creado: {new Date(user.createdAt).toLocaleDateString('es-MX')}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-amber-500 hover:bg-amber-600">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Usuario *</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Ej. jperez"
                    disabled={!!editingUser}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{editingUser ? 'Nueva Contraseña (dejar en blanco para mantener)' : 'Contraseña *'}</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? '••••••••' : 'Mínimo 6 caracteres'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rol *</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="residente">Residente de Obra</SelectItem>
                    <SelectItem value="contadora">Contadora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(443) 123-4567"
                  />
                </div>
              </div>

              {editingUser && (
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select 
                    value={formData.isActive ? 'true' : 'false'} 
                    onValueChange={(v) => setFormData({ ...formData, isActive: v === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.username || (!editingUser && !formData.password)}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Restablecer Contraseña</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nueva Contraseña *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleResetPassword}
                  disabled={newPassword.length < 6}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restablecer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-4">
          <TabsTrigger value="todos">
            Todos ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="admin">
            Admin ({usersByRole.admin.length})
          </TabsTrigger>
          <TabsTrigger value="residente">
            Residentes ({usersByRole.residente.length})
          </TabsTrigger>
          <TabsTrigger value="contadora">
            Contadoras ({usersByRole.contadora.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))}
            {filteredUsers.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No hay usuarios</p>
              </div>
            )}
          </div>
        </TabsContent>

        {(['admin', 'residente', 'contadora'] as const).map(role => (
          <TabsContent key={role} value={role} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersByRole[role].map(user => (
                <UserCard key={user.id} user={user} />
              ))}
              {usersByRole[role].length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No hay usuarios {getRoleLabel(role).toLowerCase()}s</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, User, Building2 } from 'lucide-react';
import type { Nomina, Obra, User as UserType } from '@/types';

interface NominaPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  nomina: Nomina | null;
  obra: Obra | undefined;
  currentUser: UserType;
  onConfirm: (nominaId: string, fechaPago: string, pagadoPor: string) => void;
}

export function NominaPagoModal({ 
  isOpen, 
  onClose, 
  nomina, 
  obra, 
  currentUser, 
  onConfirm 
}: NominaPagoModalProps) {
  
  const [fechaPago, setFechaPago] = useState(
    new Date().toISOString().split('T')[0]
  );

  if (!nomina) return null;

  const handleConfirm = () => {
    onConfirm(nomina.id, fechaPago, currentUser.name);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            Confirmar Pago de Nómina
          </DialogTitle>
          <DialogDescription>
            Estás a punto de registrar el pago realizado de esta nómina. Esta acción actualizará el estado financiero de la obra.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Resumen */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Obra:</span>
              <span className="font-semibold">{obra?.nombre || 'N/A'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Semana:</span>
              <span className="font-semibold">
                {nomina.numeroSemana || 'N/A'} ({nomina.semanaDel} al {nomina.semanaAl})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Empleados:</span>
              <span className="font-semibold">{nomina.empleados.length} trabajadores</span>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monto a Pagar:</span>
                <span className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(nomina.totalNomina)}
                </span>
              </div>
            </div>
          </div>

          {/* Fecha de Pago */}
          <div className="space-y-2">
            <Label htmlFor="fechaPago" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha en que se realizó el pago
            </Label>
            <Input
              id="fechaPago"
              type="date"
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Por defecto se usa la fecha de hoy, pero puedes modificarla si el pago se hizo en otra fecha.
            </p>
          </div>

          {/* Responsable */}
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-800">
                <strong>Pago registrado por:</strong> {currentUser.name} ({currentUser.role})
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Confirmar Pago Realizado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
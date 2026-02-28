import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, CheckCircle, DollarSign } from 'lucide-react';
import type { Nomina } from '@/types';

interface NominasManagerProps {
  nominas: Nomina[];
  obraName: string;
  onCreateNomina: () => void;
  onViewNomina: (nomina: Nomina) => void;
  onCambiarEstado: (id: string, estado: Nomina['estado']) => void;
}

const estadoColors = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  validada: 'bg-blue-100 text-blue-800 border-blue-300',
  autorizada: 'bg-purple-100 text-purple-800 border-purple-300',
  pagada: 'bg-green-100 text-green-800 border-green-300'
};

export function NominasManager({ nominas, obraName, onCreateNomina, onViewNomina, onCambiarEstado }: NominasManagerProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Nóminas Semanales</h2>
          <p className="text-gray-600">{obraName}</p>
        </div>
        <Button onClick={onCreateNomina} className="bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Nómina
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nominas.map((nomina) => (
          <Card key={nomina.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewNomina(nomina)}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Semana {nomina.numeroSemana}</CardTitle>
                <Badge className={estadoColors[nomina.estado]}>
                  {nomina.estado.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(nomina.semanaDel).toLocaleDateString('es-MX')} al {new Date(nomina.semanaAl).toLocaleDateString('es-MX')}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg">
                    ${nomina.totalNomina.toLocaleString('es-MX', {minimumFractionDigits: 2})}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Empleados:</span>
                  <span>{nomina.empleados.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Elaboró:</span>
                  <span>{nomina.elaboro}</span>
                </div>
              </div>

              {/* Acciones rápidas según estado */}
              <div className="mt-4 pt-4 border-t flex gap-2">
                {nomina.estado === 'pendiente' && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); onCambiarEstado(nomina.id, 'validada'); }}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Validar
                  </Button>
                )}
                {nomina.estado === 'validada' && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); onCambiarEstado(nomina.id, 'autorizada'); }}>
                    <FileText className="w-4 h-4 mr-1" /> Autorizar
                  </Button>
                )}
                {nomina.estado === 'autorizada' && (
                  <Button size="sm" className="flex-1 bg-green-600" onClick={(e) => { e.stopPropagation(); onCambiarEstado(nomina.id, 'pagada'); }}>
                    <DollarSign className="w-4 h-4 mr-1" /> Marcar Pagada
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {nominas.length === 0 && (
        <Card className="p-8 text-center text-gray-500">
          <p>No hay nóminas registradas</p>
          <p className="text-sm">Crea la primera nómina semanal</p>
        </Card>
      )}
    </div>
  );
}

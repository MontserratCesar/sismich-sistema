import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, TrendingUp, AlertCircle, Save, X } from 'lucide-react';
import type { RegistroAvanceSemanal, Obra } from '@/types';

interface AvanceSemanalFormProps {
  obra: Obra;
  semanaNumero: number;
  onSave: (avance: RegistroAvanceSemanal) => void;
  onCancel: () => void;
}

export function AvanceSemanalForm({ obra, semanaNumero, onSave, onCancel }: AvanceSemanalFormProps) {
  const [semanaDel, setSemanaDel] = useState('');
  const [semanaAl, setSemanaAl] = useState('');
  const [porcentajeEstaSemana, setPorcentajeEstaSemana] = useState(0);
  const [notas, setNotas] = useState('');
  
  // Calcular porcentaje acumulado basado en registros anteriores + esta semana
  const avanceAnterior = obra.avanceFisicoGlobal || 0;
  const porcentajeAcumulado = Math.min(avanceAnterior + porcentajeEstaSemana, 100);

  // Calcular semanas automáticamente
  useEffect(() => {
    if (obra.fechaInicio && semanaNumero) {
      const fechaInicio = new Date(obra.fechaInicio);
      const diasTranscurridos = (semanaNumero - 1) * 7;
      const inicioSemana = new Date(fechaInicio);
      inicioSemana.setDate(fechaInicio.getDate() + diasTranscurridos);
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);
      
      setSemanaDel(inicioSemana.toISOString().split('T')[0]);
      setSemanaAl(finSemana.toISOString().split('T')[0]);
    }
  }, [obra.fechaInicio, semanaNumero]);

  const handleSubmit = () => {
    onSave({
      semana: semanaNumero,
      semanaDel,
      semanaAl,
      numeroSemana: semanaNumero,
      porcentajeEstaSemana,
      porcentajeAcumulado,
      notas,
      fechaReporte: new Date().toISOString()
    });
  };

  // Calcular proyección de avance esperado
  const totalSemanas = obra.fechaTermino && obra.fechaInicio ? 
    Math.ceil((new Date(obra.fechaTermino).getTime() - new Date(obra.fechaInicio).getTime()) / (1000 * 60 * 60 * 24 * 7)) : 
    0;
  
  const avanceEsperado = totalSemanas > 0 ? (semanaNumero / totalSemanas) * 100 : 0;
  const desviacion = porcentajeAcumulado - avanceEsperado;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-6 h-6" />
            Reporte de Avance Físico - Semana {semanaNumero}
          </CardTitle>
          <p className="text-indigo-100 text-sm">{obra.nombre}</p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          
          {/* Info de período */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <Label className="text-gray-600 text-sm">Semana del:</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <Input 
                  type="date" 
                  value={semanaDel}
                  onChange={(e) => setSemanaDel(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-600 text-sm">Semana al:</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <Input 
                  type="date" 
                  value={semanaAl}
                  onChange={(e) => setSemanaAl(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          {/* Avance */}
          <div className="space-y-4">
            <div>
              <Label className="text-lg font-semibold flex justify-between">
                <span>Avance de esta semana (%)</span>
                <span className="text-indigo-600">{porcentajeEstaSemana}%</span>
              </Label>
              <Input 
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={porcentajeEstaSemana}
                onChange={(e) => setPorcentajeEstaSemana(parseFloat(e.target.value))}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600 mb-1">Avance Anterior</p>
                <p className="text-2xl font-bold text-blue-900">{avanceAnterior.toFixed(1)}%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 mb-1">Avance Acumulado</p>
                <p className="text-2xl font-bold text-green-900">{porcentajeAcumulado.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Comparativa con lo esperado */}
          {totalSemanas > 0 && (
            <div className={`p-4 rounded-lg border ${
              desviacion >= -5 ? 'bg-green-50 border-green-200' : 
              desviacion >= -15 ? 'bg-yellow-50 border-yellow-200' : 
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className={`w-5 h-5 ${
                  desviacion >= -5 ? 'text-green-600' : 
                  desviacion >= -15 ? 'text-yellow-600' : 
                  'text-red-600'
                }`} />
                <span className="font-semibold">Comparativa con Cronograma</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Avance esperado a la fecha:</span>
                  <span className="font-mono">{avanceEsperado.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Tu avance reportado:</span>
                  <span className="font-mono">{porcentajeAcumulado.toFixed(1)}%</span>
                </div>
                <div className={`flex justify-between font-bold ${
                  desviacion >= 0 ? 'text-green-700' : 
                  desviacion >= -10 ? 'text-yellow-700' : 
                  'text-red-700'
                }`}>
                  <span>Diferencia:</span>
                  <span>{desviacion > 0 ? '+' : ''}{desviacion.toFixed(1)}%</span>
                </div>
                <p className="text-xs mt-2 opacity-75">
                  {desviacion >= 0 ? '¡Vas adelantado!' : 
                   desviacion >= -10 ? 'Ligeramente atrasado, considera acelerar' : 
                   '¡Alerta! Vas significativamente atrasado'}
                </p>
              </div>
            </div>
          )}

          {/* Notas */}
          <div>
            <Label>Observaciones / Actividades realizadas:</Label>
            <Textarea 
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Se completó el vaciado de losa, se instaló el encofrado para la siguiente etapa..."
              className="mt-1 h-24"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={porcentajeEstaSemana <= 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Avance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
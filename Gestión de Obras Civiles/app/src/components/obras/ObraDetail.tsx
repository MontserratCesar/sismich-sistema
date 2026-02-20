import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Calendar, 
  User, 
  DollarSign, 
  FileText,
  Upload,
  Download,
  Trash2,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  Clock
} from 'lucide-react';
import type { Obra, Nomina, DocumentoObra, User as UserType } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';

interface ObraDetailProps {
  obra: Obra;
  nominas: Nomina[];
  documentos: DocumentoObra[];
  users: UserType[];
  currentUser: UserType;
  onBack: () => void;
  onUploadDocumento: (obraId: string, tipo: DocumentoObra['tipo'], nombre: string, file: File) => void;
  onDeleteDocumento: (id: string) => void;
  onViewNomina: (nomina: Nomina) => void;
}

const documentoTipos: { value: DocumentoObra['tipo']; label: string }[] = [
  { value: 'contrato', label: 'Contrato' },
  { value: 'presupuesto', label: 'Presupuesto' },
  { value: 'factura', label: 'Factura' },
  { value: 'orden_compra', label: 'Orden de Compra' },
  { value: 'caja_chica', label: 'Caja Chica' },
  { value: 'nota_materiales', label: 'Nota de Materiales' },
  { value: 'otro', label: 'Otro' },
];

export function ObraDetail({ 
  obra, 
  nominas, 
  documentos, 
  users, 
  currentUser, 
  onBack, 
  onUploadDocumento, 
  onDeleteDocumento,
  onViewNomina
}: ObraDetailProps) {
  const { getObraFinanzas } = useDashboard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTipo, setSelectedTipo] = useState<DocumentoObra['tipo']>('otro');

  const finanzas = getObraFinanzas(obra, nominas);
  const obraNominas = nominas.filter(n => n.obraId === obra.id);
  const obraDocumentos = documentos.filter(d => d.obraId === obra.id);
  const residente = users.find(u => u.id === obra.residenteId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const nombre = file.name.split('.')[0];
      onUploadDocumento(obra.id, selectedTipo, nombre, file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getDocumentosByTipo = (tipo: DocumentoObra['tipo']) => {
    return obraDocumentos.filter(d => d.tipo === tipo);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{obra.nombre}</h2>
          <p className="text-gray-500 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {obra.ubicacion}
          </p>
        </div>
        <Badge variant={obra.estado === 'activa' ? 'default' : 'secondary'} className="text-lg px-4 py-1">
          {obra.estado}
        </Badge>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Residente</p>
                <p className="font-semibold">{residente?.name || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Presupuesto</p>
                <p className="font-semibold">{formatCurrency(obra.presupuesto)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Período</p>
                <p className="font-semibold text-sm">
                  {new Date(obra.fechaInicio).toLocaleDateString('es-MX')} - {new Date(obra.fechaTermino).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Documentos</p>
                <p className="font-semibold">{obraDocumentos.length} archivos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="finanzas" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
          <TabsTrigger value="nominas">Nóminas ({obraNominas.length})</TabsTrigger>
          <TabsTrigger value="documentos">Documentos ({obraDocumentos.length})</TabsTrigger>
        </TabsList>

        {/* Finanzas Tab */}
        <TabsContent value="finanzas" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Avance Físico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-2">
                  <Progress value={finanzas.avanceFisico} className="flex-1" />
                  <span className="font-bold text-lg">{finanzas.avanceFisico.toFixed(1)}%</span>
                </div>
                <p className="text-sm text-gray-500">Basado en tiempo transcurrido</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Avance Financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-2">
                  <Progress value={finanzas.avanceFinanciero} className="flex-1" />
                  <span className="font-bold text-lg">{finanzas.avanceFinanciero.toFixed(1)}%</span>
                </div>
                <p className="text-sm text-gray-500">Gastos vs Presupuesto</p>
              </CardContent>
            </Card>

            <Card className={`border-0 shadow-lg ${finanzas.roi >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">ROI Estimado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`flex items-center gap-2 text-2xl font-bold ${finanzas.roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {finanzas.roi >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  {finanzas.roi.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {finanzas.roi >= 0 ? 'Proyección positiva' : 'Proyección negativa'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Desglose de Gastos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Mano de Obra</p>
                      <p className="text-sm text-gray-500">Total pagado en nóminas</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(finanzas.manoObraTotal)}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Materiales Estimados</p>
                      <p className="text-sm text-gray-500">30% del presupuesto</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(finanzas.materialesTotal)}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Gastos Totales</p>
                      <p className="text-sm text-gray-500">Suma de todos los gastos</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(finanzas.gastosTotal)}</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Desviación Presupuestal</p>
                      <p className="text-sm text-gray-500">Diferencia vs presupuesto</p>
                    </div>
                  </div>
                  <p className={`text-xl font-bold ${finanzas.desviacionPresupuestal > 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {finanzas.desviacionPresupuestal > 0 ? '+' : ''}{finanzas.desviacionPresupuestal.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nóminas Tab */}
        <TabsContent value="nominas" className="space-y-4 mt-6">
          <div className="space-y-3">
            {obraNominas.map(nomina => (
              <Card 
                key={nomina.id} 
                className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onViewNomina(nomina)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        nomina.estado === 'pagada' ? 'bg-emerald-100' :
                        nomina.estado === 'autorizada' ? 'bg-purple-100' :
                        nomina.estado === 'validada' ? 'bg-blue-100' :
                        'bg-amber-100'
                      }`}>
                        <DollarSign className={`w-5 h-5 ${
                          nomina.estado === 'pagada' ? 'text-emerald-600' :
                          nomina.estado === 'autorizada' ? 'text-purple-600' :
                          nomina.estado === 'validada' ? 'text-blue-600' :
                          'text-amber-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Semana del {new Date(nomina.semanaDel).toLocaleDateString('es-MX')} al {new Date(nomina.semanaAl).toLocaleDateString('es-MX')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {nomina.empleados.length} empleados • Elaborada: {new Date(nomina.fechaElaboracion).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(nomina.totalNomina)}</p>
                        <Badge variant="outline" className={
                          nomina.estado === 'pagada' ? 'text-emerald-600 border-emerald-200' :
                          nomina.estado === 'autorizada' ? 'text-purple-600 border-purple-200' :
                          nomina.estado === 'validada' ? 'text-blue-600 border-blue-200' :
                          'text-amber-600 border-amber-200'
                        }>
                          {nomina.estado === 'pagada' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                          {nomina.estado === 'pendiente' && <Clock className="w-3 h-3 mr-1 inline" />}
                          {nomina.estado}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {obraNominas.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No hay nóminas registradas</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Documentos Tab */}
        <TabsContent value="documentos" className="space-y-4 mt-6">
          {/* Upload Section */}
          {(currentUser.role === 'admin' || currentUser.id === obra.residenteId) && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <select
                    value={selectedTipo}
                    onChange={(e) => setSelectedTipo(e.target.value as DocumentoObra['tipo'])}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    {documentoTipos.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Documento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documentos List */}
          <div className="space-y-4">
            {documentoTipos.map(tipo => {
              const docs = getDocumentosByTipo(tipo.value);
              if (docs.length === 0) return null;
              return (
                <Card key={tipo.value} className="border-0 shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">{tipo.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {docs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{doc.nombre}</p>
                              <p className="text-xs text-gray-500">
                                {doc.fileName} • Subido: {new Date(doc.uploadedAt).toLocaleDateString('es-MX')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = doc.fileData;
                                link.download = doc.fileName;
                                link.click();
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {(currentUser.role === 'admin' || currentUser.id === obra.residenteId) && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-500"
                                onClick={() => onDeleteDocumento(doc.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {obraDocumentos.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No hay documentos</p>
                <p className="text-sm">Sube documentos para esta obra</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

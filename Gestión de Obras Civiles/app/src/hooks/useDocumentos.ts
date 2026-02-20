import { useState, useEffect, useCallback } from 'react';
import type { DocumentoObra } from '@/types';

const DOCS_KEY = 'sismich_documentos';

export function useDocumentos() {
  const [documentos, setDocumentos] = useState<DocumentoObra[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(DOCS_KEY);
    if (stored) {
      setDocumentos(JSON.parse(stored));
    }
  }, []);

  const saveDocumentos = useCallback((newDocs: DocumentoObra[]) => {
    setDocumentos(newDocs);
    localStorage.setItem(DOCS_KEY, JSON.stringify(newDocs));
  }, []);

  const uploadDocumento = useCallback((
    obraId: string, 
    tipo: DocumentoObra['tipo'], 
    nombre: string,
    file: File,
    uploadedBy: string
  ): Promise<DocumentoObra> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newDoc: DocumentoObra = {
          id: `doc-${Date.now()}`,
          obraId,
          tipo,
          nombre,
          fileName: file.name,
          fileData: reader.result as string,
          uploadedAt: new Date().toISOString(),
          uploadedBy,
        };
        const updated = [...documentos, newDoc];
        saveDocumentos(updated);
        resolve(newDoc);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, [documentos, saveDocumentos]);

  const deleteDocumento = useCallback((id: string): boolean => {
    const updated = documentos.filter(d => d.id !== id);
    saveDocumentos(updated);
    return updated.length < documentos.length;
  }, [documentos, saveDocumentos]);

  const getDocumentosByObra = useCallback((obraId: string): DocumentoObra[] => {
    return documentos.filter(d => d.obraId === obraId);
  }, [documentos]);

  const getDocumentosByTipo = useCallback((obraId: string, tipo: DocumentoObra['tipo']): DocumentoObra[] => {
    return documentos.filter(d => d.obraId === obraId && d.tipo === tipo);
  }, [documentos]);

  const downloadDocumento = useCallback((id: string): DocumentoObra | undefined => {
    return documentos.find(d => d.id === id);
  }, [documentos]);

  return {
    documentos,
    uploadDocumento,
    deleteDocumento,
    getDocumentosByObra,
    getDocumentosByTipo,
    downloadDocumento,
  };
}

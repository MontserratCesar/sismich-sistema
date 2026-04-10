/**
 * Utilidad para buscar en el catálogo de precios unitarios.
 * El archivo catalogo_temp.json es en realidad CSV con extensión .json;
 * se importa como texto plano con ?raw para evitar que Vite lo parsee como JSON.
 */
import catalogoRaw from '../../catalogo_temp.json?raw';

export interface ItemCatalogo {
  clave: string;
  partida: string;
  concepto: string;
  unidad: string;
  precioUnitario: number;
}

let _catalogo: ItemCatalogo[] | null = null;

/** Parsea una línea CSV respetando campos entre comillas. */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCatalogo(): ItemCatalogo[] {
  if (_catalogo !== null) return _catalogo;

  const lines = catalogoRaw.split('\n');
  const items: ItemCatalogo[] = [];

  // Las primeras 3 líneas son encabezados; las saltamos
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    if (fields.length < 9) continue;

    const clave = fields[0].replace(/"/g, '').trim();
    const partida = fields[1].replace(/"/g, '').trim();
    const concepto = fields[2].replace(/"/g, '').trim();
    const unidad = fields[3].replace(/"/g, '').trim();
    // Columna 8 = P.U. AJUSTADO (índice base-0)
    const precioStr = (fields[8] || '').replace(/[$,\s"]/g, '');
    const precioUnitario = parseFloat(precioStr) || 0;

    if (clave && concepto && concepto.length > 3) {
      items.push({ clave, partida, concepto, unidad, precioUnitario });
    }
  }

  _catalogo = items;
  console.log(`Catálogo cargado: ${items.length} conceptos`);
  return items;
}

/** Busca conceptos por clave, partida o texto libre del concepto. */
export function buscarEnCatalogo(query: string, limit = 15): ItemCatalogo[] {
  if (!query || query.length < 2) return [];

  const catalogo = parseCatalogo();
  const q = query.toLowerCase().trim();

  return catalogo
    .filter(item =>
      item.clave.toLowerCase().startsWith(q) ||
      item.concepto.toLowerCase().includes(q) ||
      item.partida.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

/** Busca un concepto exacto por clave. */
export function buscarPorClave(clave: string): ItemCatalogo | undefined {
  if (!clave) return undefined;
  return parseCatalogo().find(
    item => item.clave.toLowerCase() === clave.toLowerCase()
  );
}

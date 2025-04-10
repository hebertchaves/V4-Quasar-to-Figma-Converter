// src/components/display/table-component.ts
import { QuasarNode, PluginSettings } from '../../types/settings';
import { extractStylesAndProps, findChildrenByTagName } from '../../utils/quasar-utils';
import { applyStylesToFigmaNode, createText } from '../../utils/figma-utils';
import { quasarColors } from '../../data/color-map';

export async function processTableComponent(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const tableFrame = figma.createFrame();
  tableFrame.name = "q-table";
  
  // Configuração básica de layout
  tableFrame.layoutMode = "VERTICAL";
  tableFrame.primaryAxisSizingMode = "AUTO";
  tableFrame.counterAxisSizingMode = "FIXED";
  tableFrame.width = 600;
  
  // Estilos de tabela
  tableFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  tableFrame.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
  tableFrame.strokeWeight = 1;
  
  // Extrair propriedades
  const { props, styles } = extractStylesAndProps(node);
  
  // Lógica de renderização da tabela
  const headers = props.columns || [
    { name: 'ID', field: 'id' },
    { name: 'Nome', field: 'name' },
    { name: 'Email', field: 'email' }
  ];
  
  const headerFrame = await createTableHeader(headers, settings);
  tableFrame.appendChild(headerFrame);

  // Definir tipagem correta para headers
const headers: { name: string; field: string }[] = [
  { name: 'ID', field: 'id' },
  { name: 'Nome', field: 'name' },
  { name: 'Email', field: 'email' }
];

// Passar headers com tipagem correta
const headerFrame = await createTableHeader(headers, settings);
const rowsFrame = await createTableRows(headers, rowsData, settings);
  
  // Adicionar linhas de dados
  const rowsData = props.rows || [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];
  
  const rowsFrame = await createTableRows(headers, rowsData, settings);
  tableFrame.appendChild(rowsFrame);
  
  return tableFrame;
}

async function createTableHeader(headers: any[], settings: PluginSettings): Promise<FrameNode> {
  const headerFrame = figma.createFrame();
  headerFrame.name = "q-table-header";
  headerFrame.layoutMode = "HORIZONTAL";
  headerFrame.primaryAxisSizingMode = "FILL";
  headerFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }];
  
  for (const header of headers) {
    const headerCell = await createText(header.name, {
      fontSize: 14,
      fontWeight: 'bold'
    });
    headerFrame.appendChild(headerCell);
  }
  
  return headerFrame;
}

async function createTableRows(headers: any[], rows: any[], settings: PluginSettings): Promise<FrameNode> {
  const rowsFrame = figma.createFrame();
  rowsFrame.name = "q-table-rows";
  rowsFrame.layoutMode = "VERTICAL";
  
  for (const row of rows) {
    const rowFrame = figma.createFrame();
    rowFrame.layoutMode = "HORIZONTAL";
    
    for (const header of headers) {
      const cellText = await createText(row[header.field] || '', {
        fontSize: 12
      });
      rowFrame.appendChild(cellText);
    }
    
    rowsFrame.appendChild(rowFrame);
  }
  
  return rowsFrame;
}
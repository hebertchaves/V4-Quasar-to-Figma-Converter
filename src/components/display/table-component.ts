// src/components/display/table-component.ts
import { QuasarNode, PluginSettings } from '../../types/settings';
import { extractStylesAndProps, findChildrenByTagName } from '../../utils/quasar-utils';
import { applyStylesToFigmaNode, createText } from '../../utils/figma-utils';
import { quasarColors } from '../../data/color-map';

/**
 * Processa um componente de tabela Quasar (q-table)
 */
export async function processTableComponent(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const tableFrame = figma.createFrame();
  tableFrame.name = "q-table";
  
  // Configuração básica
  tableFrame.layoutMode = "VERTICAL";
  tableFrame.primaryAxisSizingMode = "AUTO";
  tableFrame.counterAxisSizingMode = "FIXED";
  tableFrame.width = 600;
  tableFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  tableFrame.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
  tableFrame.strokeWeight = 1;
  
  // Extrair propriedades e estilos
  const { props, styles } = extractStylesAndProps(node);
  
  // Criar cabeçalho da tabela
  const headerFrame = figma.createFrame();
  headerFrame.name = "q-table__header";
  headerFrame.layoutMode = "HORIZONTAL";
  headerFrame.primaryAxisSizingMode = "FILL";
  headerFrame.counterAxisSizingMode = "AUTO";
  headerFrame.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 } }];
  headerFrame.paddingTop = 12;
  headerFrame.paddingBottom = 12;
  headerFrame.itemSpacing = 0;
  
  // Criar células do cabeçalho
  const headers = ['ID', 'Name', 'Email', 'Role'];
  const colWidths = [80, 200, 200, 120];
  
  for (let i = 0; i < headers.length; i++) {
    const headerCell = figma.createFrame();
    headerCell.name = `q-th-${i+1}`;
    headerCell.layoutMode = "HORIZONTAL";
    headerCell.primaryAxisSizingMode = "FIXED";
    headerCell.counterAxisSizingMode = "FILL";
    headerCell.width = colWidths[i];
    headerCell.paddingLeft = 16;
    headerCell.paddingRight = 16;
    headerCell.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 0 } }];
    
    const headerText = await createText(headers[i], {
      fontSize: 14,
      fontWeight: 'bold'
    });
    
    headerCell.appendChild(headerText);
    headerFrame.appendChild(headerCell);
  }
  
  tableFrame.appendChild(headerFrame);
  
  // Criar linhas de dados
  const rows = [
    ['1', 'John Doe', 'john@example.com', 'Admin'],
    ['2', 'Jane Smith', 'jane@example.com', 'User'],
    ['3', 'Bob Johnson', 'bob@example.com', 'Editor']
  ];
  
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const rowFrame = figma.createFrame();
    rowFrame.name = `q-tr-${rowIndex+1}`;
    rowFrame.layoutMode = "HORIZONTAL";
    rowFrame.primaryAxisSizingMode = "FILL";
    rowFrame.counterAxisSizingMode = "AUTO";
    rowFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    rowFrame.paddingTop = 12;
    rowFrame.paddingBottom = 12;
    rowFrame.itemSpacing = 0;
    
    if (rowIndex < rows.length - 1) {
      rowFrame.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
      rowFrame.strokeBottomWeight = 1;
    }
    
    // Células da linha
    for (let colIndex = 0; colIndex < rows[rowIndex].length; colIndex++) {
      const cell = figma.createFrame();
      cell.name = `q-td-${rowIndex+1}-${colIndex+1}`;
      cell.layoutMode = "HORIZONTAL";
      cell.primaryAxisSizingMode = "FIXED";
      cell.counterAxisSizingMode = "FILL";
      cell.width = colWidths[colIndex];
      cell.paddingLeft = 16;
      cell.paddingRight = 16;
      cell.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 0 } }];
      
      const cellText = await createText(rows[rowIndex][colIndex], {
        fontSize: 14
      });
      
      cell.appendChild(cellText);
      rowFrame.appendChild(cell);
    }
    
    tableFrame.appendChild(rowFrame);
  }
  
  // Adicionar paginação
  if (props.pagination !== 'false') {
    const paginationFrame = figma.createFrame();
    paginationFrame.name = "q-table__pagination";
    paginationFrame.layoutMode = "HORIZONTAL";
    paginationFrame.primaryAxisSizingMode = "FILL";
    paginationFrame.counterAxisSizingMode = "AUTO";
    paginationFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
    paginationFrame.paddingLeft = 16;
    paginationFrame.paddingRight = 16;
    paginationFrame.paddingTop = 12;
    paginationFrame.paddingBottom = 12;
    paginationFrame.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 } }];
    
    // Informações da paginação
    const pageInfoText = await createText("1-3 of 7", {
      fontSize: 12,
      color: { r: 0.5, g: 0.5, b: 0.5 }
    });
    
    // Controles da paginação
    const paginationControls = figma.createFrame();
    paginationControls.name = "q-table__pagination-controls";
    paginationControls.layoutMode = "HORIZONTAL";
    paginationControls.primaryAxisSizingMode = "AUTO";
    paginationControls.counterAxisSizingMode = "AUTO";
    paginationControls.itemSpacing = 8;
    paginationControls.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0, a: 0 } }];
    
    // Botões de paginação
    const prevButton = figma.createFrame();
    prevButton.name = "q-pagination__prev";
    prevButton.resize(32, 32);
    prevButton.cornerRadius = 4;
    prevButton.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
    
    const prevIcon = await createText("<", {
      fontSize: 14,
      alignment: 'CENTER',
      verticalAlignment: 'CENTER'
    });
    
    prevButton.appendChild(prevIcon);
    
    const nextButton = figma.createFrame();
    nextButton.name = "q-pagination__next";
    nextButton.resize(32, 32);
    nextButton.cornerRadius = 4;
    nextButton.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
    
    const nextIcon = await createText(">", {
      fontSize: 14,
      alignment: 'CENTER',
      verticalAlignment: 'CENTER'
    });
    
    nextButton.appendChild(nextIcon);
    
    paginationControls.appendChild(prevButton);
    paginationControls.appendChild(nextButton);
    
    paginationFrame.appendChild(pageInfoText);
    paginationFrame.appendChild(paginationControls);
    
    tableFrame.appendChild(paginationFrame);
  }
  
  return tableFrame;
}
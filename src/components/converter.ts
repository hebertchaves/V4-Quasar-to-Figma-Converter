import { parseQuasarTemplate, extractTemplateContent } from '../parser/template';
import { loadRequiredFonts } from '../utils/figma-utils';
import { PluginSettings, QuasarNode } from '../types/settings';
import { detectComponentType } from '../utils/quasar-utils';

// Importações dos processadores de componentes
import { processBasicComponents } from './basic/basic-components';
import { processFormComponents } from './form/form-components';
import { processLayoutComponents } from './layout/layout-components';
import { processNavigationComponents } from './navigation/navigation-components';
import { processPopupComponents } from './popup/popup-components';
import { processScrollingComponents } from './scrolling/scrolling-components';
import { processDisplayComponents } from './display/display-components';
import { processOtherComponents } from './other/other-components';

/**
 * Função principal de conversão
 */
export async function convertQuasarToFigma(code: string, settings: PluginSettings) {
  // Carregar fontes antes de iniciar a conversão
  await loadRequiredFonts();
  
  try {
    // Extrair o conteúdo do template
    const templateContent = extractTemplateContent(code);
    
    // Analisar o HTML em uma árvore de nós
    const rootNode = parseQuasarTemplate(templateContent);
    if (!rootNode) {
      throw new Error('Falha ao analisar o template HTML');
    }
    
    // Detectar tipo de componente
    const componentType = detectComponentType(rootNode);
    
    // Notificar progresso
    figma.ui.postMessage({
      type: 'processing-update',
      message: `Detectado componente: ${componentType.category}/${componentType.type}`,
      componentType: componentType
    });
    
    // Criar o nó raiz do Figma
    const mainFrame = figma.createFrame();
    mainFrame.name = "Componente Quasar";
    mainFrame.layoutMode = "VERTICAL";
    mainFrame.primaryAxisSizingMode = "AUTO";
    mainFrame.counterAxisSizingMode = "AUTO";
    mainFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    mainFrame.paddingLeft = 20;
    mainFrame.paddingRight = 20;
    mainFrame.paddingTop = 20;
    mainFrame.paddingBottom = 20;
    mainFrame.itemSpacing = 16;
    
    // Adicionar metadados
    mainFrame.setPluginData('quasarComponent', 'true');
    mainFrame.setPluginData('componentType', `${componentType.category}/${componentType.type}`);
    
    // Processar o componente com base em sua categoria
    let processedComponent: FrameNode | null = null;
    
    switch (componentType.category) {
      case 'basic':
        processedComponent = await processBasicComponents(rootNode, componentType.type, settings);
        break;
        
      case 'form':
        processedComponent = await processFormComponents(rootNode, componentType.type, settings);
        break;
        
      case 'layout':
        processedComponent = await processLayoutComponents(rootNode, componentType.type, settings);
        break;
        
      case 'navigation':
        processedComponent = await processNavigationComponents(rootNode, componentType.type, settings);
        break;
        
      case 'popup':
        processedComponent = await processPopupComponents(rootNode, componentType.type, settings);
        break;
        
      case 'scrolling':
        processedComponent = await processScrollingComponents(rootNode, componentType.type, settings);
        break;
        
      case 'display':
        processedComponent = await processDisplayComponents(rootNode, componentType.type, settings);
        break;
        
      case 'other':
        processedComponent = await processOtherComponents(rootNode, componentType.type, settings);
        break;
        
      default:
        // Processar como componente genérico
        processedComponent = await processGenericComponent(rootNode, settings);
        break;
    }
    
    // Adicionar o componente processado ao frame principal
    if (processedComponent) {
      mainFrame.appendChild(processedComponent);
    }
    
    // Adicionar à página atual do Figma
    figma.currentPage.appendChild(mainFrame);
    
    // Notificar progresso
    figma.ui.postMessage({
      type: 'processing-update',
      message: 'Componente convertido com sucesso',
      componentType: componentType
    });
    
    return mainFrame;
  } catch (error) {
    console.error('Erro ao processar componente:', error);
    throw error;
  }
}

/**
 * Processa componente genérico quando não houver conversor específico
 */
export async function processGenericComponent(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = node.tagName || "generic-component";
  frame.layoutMode = "VERTICAL";
  frame.primaryAxisSizingMode = "AUTO";
  frame.counterAxisSizingMode = "AUTO";
  frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  frame.cornerRadius = 4;
  
  // Adicionar texto que indica o tipo de componente
  const headerText = figma.createText();
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  headerText.characters = `Componente ${node.tagName}`;
  headerText.fontSize = 16;
  headerText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
  
  frame.appendChild(headerText);
  
  // Processar atributos relevantes
  if (node.attributes && Object.keys(node.attributes).length > 0) {
    const attrsText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    
    const attrStr = Object.entries(node.attributes)
      .filter(([key, _]) => key !== 'style' && key !== 'class')
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n');
    
    attrsText.characters = attrStr || "Sem atributos";
    attrsText.fontSize = 12;
    attrsText.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
    
    frame.appendChild(attrsText);
  }
  
  return frame;
}
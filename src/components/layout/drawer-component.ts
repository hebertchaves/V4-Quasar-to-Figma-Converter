// src/components/layout/drawer-component.ts
import { QuasarNode, PluginSettings } from '../../types/settings';
import { extractStylesAndProps } from '../../utils/quasar-utils';
import { applyStylesToFigmaNode, createText } from '../../utils/figma-utils';
import { quasarColors } from '../../data/color-map';

export async function processDrawerComponent(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const drawerFrame = figma.createFrame();
  drawerFrame.name = "q-drawer";
  
  // Correção para width e height
  // Use resize() em vez de atribuição direta
  drawerFrame.resize(256, 768);  // Substitui width e height diretos

  // Configuração de layout
  drawerFrame.layoutMode = "VERTICAL";
  
  // Correção para sizing modes
  drawerFrame.primaryAxisSizingMode = "FIXED";
  drawerFrame.counterAxisSizingMode = "FIXED";
  
  drawerFrame.itemSpacing = 0;
  drawerFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  
  // Adicionar sombra
  drawerFrame.effects = [
    {
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 2, y: 0 },
      radius: 4,
      visible: true,
      blendMode: 'NORMAL'
    }
  ];

  // Extrair propriedades
  const { props, styles } = extractStylesAndProps(node);
  
  // Verificar se há um atributo de cor para o drawer
  const drawerColorAttr = props.color;
  if (drawerColorAttr && quasarColors[drawerColorAttr] && settings.preserveQuasarColors) {
    drawerFrame.fills = [{ type: 'SOLID', color: quasarColors[drawerColorAttr] }];
  }

  // Adicionar lista ao drawer
  const listFrame = figma.createFrame();
  listFrame.name = "q-list";
  
  // Correção para sizing modes
  listFrame.layoutMode = "VERTICAL";
  listFrame.primaryAxisSizingMode = "AUTO";
  listFrame.counterAxisSizingMode = "FIXED";
  
  // Use resize() para definir dimensões
  listFrame.resize(256, 768);
  
  listFrame.itemSpacing = 0;
  listFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

  // Adicionar alguns itens de menu de exemplo
  const menuItems = ["Home", "Perfil", "Configurações", "Sobre"];
  
  for (const itemText of menuItems) {
    const itemFrame = figma.createFrame();
    itemFrame.name = "q-item";
    
    // Configuração de layout
    itemFrame.layoutMode = "HORIZONTAL";
    itemFrame.primaryAxisSizingMode = "FIXED";
    itemFrame.counterAxisSizingMode = "AUTO";
    
    // Use resize() para definir largura
    itemFrame.resize(256, itemFrame.height);
    
    itemFrame.paddingLeft = 16;
    itemFrame.paddingRight = 16;
    itemFrame.paddingTop = 12;
    itemFrame.paddingBottom = 12;
    itemFrame.primaryAxisAlignItems = "SPACE_BETWEEN";
    itemFrame.counterAxisAlignItems = "CENTER";
    itemFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    
    const textNode = await createText(itemText, {
      color: { r: 0, g: 0, b: 0 }
    });
    itemFrame.appendChild(textNode);
    listFrame.appendChild(itemFrame);
  }
  
  drawerFrame.appendChild(listFrame);
  
  return drawerFrame;
}
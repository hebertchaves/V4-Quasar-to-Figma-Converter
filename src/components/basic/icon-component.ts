// src/components/basic/icon-component.ts
import { QuasarNode, PluginSettings } from '../../types/settings';
import { extractStylesAndProps } from '../../utils/quasar-utils';
import { applyStylesToFigmaNode, createText } from '../../utils/figma-utils';
import { quasarColors } from '../../data/color-map';

/**
 * Processa um componente de ícone Quasar (q-icon)
 */
export async function processIconComponent(node: QuasarNode, settings: PluginSettings): Promise<FrameNode> {
  const iconFrame = figma.createFrame();
  iconFrame.name = "q-icon";
  
  // Extrair propriedades e estilos
  const { props, styles } = extractStylesAndProps(node);
  
  // Determinar tamanho do ícone
  let iconSize = 24; // Tamanho padrão
  
  if (props.size) {
    // Converter tamanhos nomeados para pixels
    switch (props.size) {
      case 'xs': iconSize = 16; break;
      case 'sm': iconSize = 20; break;
      case 'md': iconSize = 24; break;
      case 'lg': iconSize = 32; break;
      case 'xl': iconSize = 40; break;
      default:
        // Verificar se é um valor numérico em pixels
        const sizeMatch = props.size.match(/^(\d+)(px)?$/);
        if (sizeMatch) {
          iconSize = parseInt(sizeMatch[1]);
        }
    }
  }
  
  // Configurar o frame
  iconFrame.resize(iconSize, iconSize);
  iconFrame.layoutMode = "HORIZONTAL";
  iconFrame.primaryAxisAlignItems = "CENTER";
  iconFrame.counterAxisAlignItems = "CENTER";
  iconFrame.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, opacity: 0 }];
  
  // Determinar cor do ícone
  let iconColor = { r: 0, g: 0, b: 0 }; // Preto por padrão
  
  if (props.color && quasarColors[props.color] && settings.preserveQuasarColors) {
    iconColor = quasarColors[props.color];
  }
  
  // Extrair nome do ícone
  let iconName = props.name || "";
  
  if (!iconName && node.attributes && node.attributes.class) {
    // Alguns ícones são definidos pela classe, como "fas fa-home"
    const classNames = node.attributes.class.split(" ");
    for (const className of classNames) {
      if (className.startsWith("fa-")) {
        iconName = className.substring(3);
        break;
      }
    }
  }
  // Correção na definição de fills, removendo propriedade 'opacity' inválida
  iconFrame.fills = [{ 
    type: 'SOLID', 
    color: { r: 0, g: 0, b: 0 } 
  }];
  // Criar uma representação visual do ícone (simplificada)
  const iconVisual = figma.createFrame();
  iconVisual.name = `icon-${iconName || "default"}`;
  iconVisual.resize(iconSize * 0.7, iconSize * 0.7);
  iconVisual.fills = [{ type: 'SOLID', color: iconColor }];
  
  // Usar texto para mostrar o nome do ícone
  if (iconName) {
    const iconText = await createText(iconName.charAt(0).toUpperCase(), {
      fontSize: iconSize * 0.5,
      color: { r: 1, g: 1, b: 1 },
      alignment: 'CENTER',
      verticalAlignment: 'CENTER'
    });
    
    iconVisual.appendChild(iconText);
  }
  
  iconFrame.appendChild(iconVisual);
  
  return iconFrame;
}
// src/components/basic/separator-component.ts
import { QuasarNode, PluginSettings } from '../../types/settings';
import { extractStylesAndProps } from '../../utils/quasar-utils';
import { applyStylesToFigmaNode } from '../../utils/figma-utils';
// Importar utilitário de redimensionamento
import { setNodeSize } from '../../utils/figma-utils';
import { quasarColors } from '../../data/color-map';

// Substituir modificações diretas de dimensões
if (props.spaced === 'true' || props.spaced === '') {
  const spacedValue = typeof props.spaced === 'string' && props.spaced !== 'true' ? 
    parseInt(props.spaced) : 
    16;
      
  if (isVertical) {
    separator.y = spacedValue;
    // Usar método seguro de redimensionamento
    setNodeSize(separator, separator.width, separator.height - (2 * spacedValue));
  } else {
    separator.x = spacedValue;
    // Usar método seguro de redimensionamento
    setNodeSize(separator, separator.width - (2 * spacedValue), separator.height);
  }
}

// Substituir referência a colorMap por quasarColors
const separatorColor = props.color && quasarColors[props.color] 
  ? quasarColors[props.color] 
  : { r: 0.9, g: 0.9, b: 0.9 };
/**
 * Processa um componente separador Quasar (q-separator)
 */
export async function processSeparatorComponent(node: QuasarNode, settings: PluginSettings): Promise<RectangleNode> {
  const separator = figma.createRectangle();
  separator.name = "q-separator";
  
  // Extrair propriedades e estilos
  const { props, styles } = extractStylesAndProps(node);
  
  // Definir espessura (height ou width, dependendo da orientação)
  const thickness = props.size ? parseInt(props.size) : 1;
  
  // Verificar orientação
  const isVertical = props.vertical === 'true' || props.vertical === '';
  
  if (isVertical) {
    separator.resize(thickness, 100);
  } else {
    separator.resize(300, thickness);
  }
  
  // Definir cor
  let separatorColor = { r: 0.9, g: 0.9, b: 0.9 }; // Cinza claro padrão
  
  if (props.color && settings.preserveQuasarColors) {
    const colorName = props.color;
    if (colorName in settings.colorMap) {
      separatorColor = settings.colorMap[colorName];
    }
  }
  
  separator.fills = [{ type: 'SOLID', color: separatorColor }];
  
  // Verificar se tem bordas arredondadas
  if (props.spaced === 'true' || props.spaced === '') {
    // Adicionar margem interna
    const spacedValue = typeof props.spaced === 'string' && props.spaced !== 'true' ? 
      parseInt(props.spaced) : 
      16; // Valor padrão de espaçamento
      
    if (isVertical) {
      separator.y = spacedValue;
      separator.height -= 2 * spacedValue;
    } else {
      separator.x = spacedValue;
      separator.width -= 2 * spacedValue;
    }
  }
  
  // Bordas arredondadas
  if (props.inset === 'true' || props.inset === '') {
    separator.cornerRadius = thickness / 2;
  }
  
  return separator;
}
import { QuasarNode, ComponentTypeInfo } from '../types/settings';
import { cssColorToFigmaColor } from './style-utils';

/**
 * Extrai estilos e props de um nó Quasar
 */
export function extractStylesAndProps(node: QuasarNode) {
  const props: Record<string, string> = {};
  const styles: Record<string, any> = {};
  
  // Extrair atributos do nó
  if (node.attributes) {
    Object.keys(node.attributes).forEach(attr => {
      // Props do Quasar ou atributos personalizados v-model, :value, etc.
      if (attr.startsWith(':') || attr.startsWith('v-')) {
        props[attr.replace(/^[v:][-:]?/, '')] = node.attributes[attr];
      } else if (attr === 'style') {
        const inlineStyles = parseInlineStyles(node.attributes.style);
        Object.assign(styles, inlineStyles);
      } else if (attr === 'class') {
        props['class'] = node.attributes.class;
      } else {
        props[attr] = node.attributes[attr];
      }
    });
  }
  
  return { props, styles };
}

/**
 * Analisa string de estilos inline
 */
export function parseInlineStyles(styleString?: string) {
  if (!styleString) return {};
  
  const styles: Record<string, any> = {};
  const declarations = styleString.split(';');
  
  for (const declaration of declarations) {
    if (!declaration.trim()) continue;
    
    const parts = declaration.split(':');
    if (parts.length !== 2) continue;
    
    const [property, value] = parts.map(s => s.trim());
    if (property && value) {
      // Converter para camelCase para compatibilidade com JS
      const camelProperty = property.replace(/-([a-z])/g, (_, g1) => g1.toUpperCase());
      
      // Processar valores especiais (cores, unidades, etc.)
      if (property.includes('color')) {
        // Converter cores para formato Figma
        const figmaColor = cssColorToFigmaColor(value);
        if (figmaColor) {
          styles[camelProperty] = figmaColor;
          continue;
        }
      }
      
      // Processar valores com unidades (px, em, rem, vh, vw, %)
      if (value.match(/^-?\d+(\.\d+)?(px|em|rem|vh|vw|%)$/)) {
        const numValue = parseFloat(value);
        const unit = value.replace(/^-?\d+(\.\d+)?/, '');
        
        // Converter unidades para pixels (aproximação simples)
        if (unit === 'px') {
          styles[camelProperty] = numValue;
        } else if (unit === 'rem' || unit === 'em') {
          // Considerando 1rem = 16px (aproximação padrão)
          styles[camelProperty] = numValue * 16;
        } else {
          // Para outras unidades, manter o valor original como string
          styles[camelProperty] = value;
        }
        continue;
      }
      
      // Para outros valores, manter como string
      styles[camelProperty] = value;
    }
  }
  
  return styles;
}

/**
 * Encontra um filho com uma determinada tag
 */
export function findChildByTagName(node: QuasarNode, tagName: string): QuasarNode | null {
  if (!node.childNodes || node.childNodes.length === 0) {
    return null;
  }
  
  // Converter para minúsculas para comparação case-insensitive
  const targetTag = tagName.toLowerCase();
  
  for (const child of node.childNodes) {
    if (child.tagName && child.tagName.toLowerCase() === targetTag) {
      return child;
    }
    
    // Busca recursiva
    const found = findChildByTagName(child, tagName);
    if (found) {
      return found;
    }
  }
  
  return null;
}

/**
 * Encontra todos os filhos com uma determinada tag
 */
export function findChildrenByTagName(node: QuasarNode, tagName: string): QuasarNode[] {
  const results: QuasarNode[] = [];
  
  if (!node.childNodes || node.childNodes.length === 0) {
    return results;
  }
  
  // Converter para minúsculas para comparação case-insensitive
  const targetTag = tagName.toLowerCase();
  
  for (const child of node.childNodes) {
    if (child.tagName && child.tagName.toLowerCase() === targetTag) {
      results.push(child);
    }
    
    // Busca recursiva
    const childResults = findChildrenByTagName(child, tagName);
    results.push(...childResults);
  }
  
  return results;
}

/**
 * Extrai o texto de um botão a partir de várias fontes possíveis
 */
export function getButtonText(node: QuasarNode): string {
  // Verificar atributo label
  if (node.attributes && node.attributes.label) {
    return node.attributes.label;
  }
  
  // Verificar conteúdo de texto direto
  for (const child of node.childNodes) {
    if (child.tagName === '#text' && child.text && child.text.trim()) {
      return child.text.trim();
    }
  }
  
  // Verificar filhos para span ou outros elementos de texto
  for (const child of node.childNodes) {
    if (child.tagName && ['span', 'div'].includes(child.tagName.toLowerCase())) {
      // Extrair texto recursivamente do filho
      const childText = getButtonText(child);
      if (childText) {
        return childText;
      }
    }
  }
  
  // Texto padrão se nada for encontrado
  return "Botão";
}

/**
 * Detecta o tipo e categoria de um componente Quasar
 */
export function detectComponentType(node: QuasarNode): ComponentTypeInfo {
  const tagName = node.tagName.toLowerCase();
  
  // Componentes básicos
  if (['q-btn', 'q-icon', 'q-avatar', 'q-badge', 'q-chip', 'q-card', 'q-separator'].includes(tagName)) {
    return { category: 'basic', type: tagName.substring(2) }; // Remove o "q-"
  }
  
  // Componentes de formulário
  if (['q-input', 'q-select', 'q-checkbox', 'q-radio', 'q-toggle', 'q-slider', 'q-rating', 'q-form', 'q-field'].includes(tagName)) {
    return { category: 'form', type: tagName.substring(2) };
  }
  
  // Componentes de layout
  if (['q-layout', 'q-page', 'q-drawer', 'q-header', 'q-footer', 'q-page-container', 'q-toolbar', 'q-bar'].includes(tagName)) {
    return { category: 'layout', type: tagName.substring(2) };
  }
  
  // Componentes de navegação
  if (['q-tabs', 'q-tab', 'q-tab-panels', 'q-tab-panel', 'q-breadcrumbs', 'q-pagination', 'q-stepper'].includes(tagName)) {
    return { category: 'navigation', type: tagName.substring(2) };
  }
  
  // Componentes de popup
  if (['q-dialog', 'q-tooltip', 'q-menu', 'q-popup-edit', 'q-popup-proxy'].includes(tagName)) {
    return { category: 'popup', type: tagName.substring(2) };
  }
  
  // Componentes de rolagem
  if (['q-scroll-area', 'q-infinite-scroll', 'q-pull-to-refresh'].includes(tagName)) {
    return { category: 'scrolling', type: tagName.substring(2) };
  }
  
  // Componentes de exibição
  if (['q-table', 'q-list', 'q-item', 'q-carousel', 'q-timeline', 'q-tree'].includes(tagName)) {
    return { category: 'display', type: tagName.substring(2) };
  }
  
  // Outros componentes
  if (['q-banner', 'q-expansion-item', 'q-skeleton', 'q-chat-message', 'q-uploader'].includes(tagName)) {
    return { category: 'other', type: tagName.substring(2) };
  }
  
  // Componente genérico ou desconhecido
  return { category: 'unknown', type: tagName };
}
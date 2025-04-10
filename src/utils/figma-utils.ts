// src/utils/figma-utils.ts
import { RGB, RGBA, ExtractedStyles } from '../types/settings';

/**
 * Carrega as fontes necessárias para uso no Figma
 */
export async function loadRequiredFonts() {
  // Lista de fontes usadas pelo plugin
  const requiredFonts = [
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Medium" },
    { family: "Inter", style: "Bold" }
  ];
  
  // Carregar todas as fontes em paralelo
  const fontLoadPromises = requiredFonts.map(font => 
    figma.loadFontAsync(font)
  );
  
  // Aguardar o carregamento de todas as fontes
  await Promise.all(fontLoadPromises);
}

/**
 * Ajusta o tamanho de um nó Figma de forma segura
 */
export function setNodeSize(node: SceneNode, width: number, height?: number) {
  if ('resize' in node) {
    const currentHeight = 'height' in node ? node.height : 0;
    node.resize(width, height !== undefined ? height : currentHeight);
  }
}

/**
 * Cria um nó de texto no Figma
 */
export async function createText(content: string, options: any = {}): Promise<TextNode | null> {
  try {
    const textNode = figma.createText();
    
    // Garantir que a fonte esteja carregada
    await figma.loadFontAsync({
      family: options.fontFamily || "Inter",
      style: options.fontStyle || "Regular"
    });
    
    // Definir o texto
    textNode.characters = content || '';
    
    // Configurações de texto
    if (options.fontSize) textNode.fontSize = options.fontSize;
    if (options.fontWeight) {
      if (options.fontWeight === 'bold') {
        await figma.loadFontAsync({ family: "Inter", style: "Bold" });
        textNode.fontName = { family: "Inter", style: "Bold" };
      } else if (options.fontWeight === 'medium') {
        await figma.loadFontAsync({ family: "Inter", style: "Medium" });
        textNode.fontName = { family: "Inter", style: "Medium" };
      }
    }
    
    // Cor do texto
    if (options.color) {
      textNode.fills = [{ type: 'SOLID', color: options.color }];
    }
    
    // Definir fills diretamente se fornecido
    if (options.fills) {
      textNode.fills = options.fills;
    }
    
    // Opacidade
    if (options.opacity !== undefined && textNode.fills && Array.isArray(textNode.fills) && textNode.fills.length > 0) {
      const fills = [...textNode.fills];
      
      for (let i = 0; i < fills.length; i++) {
        const fill = fills[i];
        if (fill.type === 'SOLID') {
          fill.opacity = options.opacity;
        }
      }
      
      textNode.fills = fills;
    }
    
    // Alinhamento
    if (options.alignment) {
      textNode.textAlignHorizontal = options.alignment;
    }
    
    if (options.verticalAlignment) {
      textNode.textAlignVertical = options.verticalAlignment;
    }
    
    return textNode;
  } catch (error) {
    console.error('Erro ao criar texto:', error);
    return null;
  }
}

/**
 * Aplica estilos a um nó do Figma
 */
export function applyStylesToFigmaNode(node: any, styles: Record<string, any>) {
  if (!styles || typeof styles !== 'object') return;
  
  // Processa cada propriedade de estilo
  Object.entries(styles).forEach(([key, value]) => {
    try {
      // Propriedades especiais que precisam de tratamento específico
      if (key === 'fills') {
        node.fills = value;
      } else if (key === 'strokes') {
        node.strokes = value;
      } else if (key === 'effects') {
        node.effects = value;
      } else if (key === 'fontName') {
        // Não aplicar fontName aqui - deve ser feito após carregar a fonte
      } else if (key === 'fontColor' && node.fills && Array.isArray(node.fills)) {
        // Aplicar cor de texto mantendo outros parâmetros de fill
        const fills = [...node.fills];
        if (fills.length > 0 && fills[0].type === 'SOLID') {
          fills[0].color = value;
          node.fills = fills;
        } else {
          node.fills = [{ type: 'SOLID', color: value }];
        }
      } else {
        // Tentar aplicar a propriedade diretamente
        node[key] = value;
      }
    } catch (error) {
      console.warn(`Não foi possível aplicar a propriedade ${key} ao nó:`, error);
    }
  });
}

/**
 * Cria um efeito de sombra para nós Figma
 */
export function createShadowEffect(
  offsetX: number, 
  offsetY: number, 
  radius: number, 
  opacity: number, 
  color: RGB = { r: 0, g: 0, b: 0 }
): Effect {
  return {
    type: 'DROP_SHADOW',
    color: { ...color, a: opacity },
    offset: { x: offsetX, y: offsetY },
    radius: radius,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL'
  } as Effect;
}

/**
 * Determina a cor de texto contrastante com base na cor de fundo
 */
export function getContrastingTextColor(bgColor: RGB): RGB {
  // Calcular luminosidade aproximada
  const luminance = 0.299 * bgColor.r + 0.587 * bgColor.g + 0.114 * bgColor.b;
  
  // Se a luminosidade for alta, usar texto escuro, caso contrário usar texto claro
  return luminance > 0.5 ? { r: 0, g: 0, b: 0 } : { r: 1, g: 1, b: 1 };
}

/**
 * Verifica se um Paint é do tipo SolidPaint
 */
export function isSolidPaint(paint: Paint): paint is SolidPaint {
  return paint.type === 'SOLID';
}

/**
 * Aplica fills de forma segura aos nós Figma
 */
export function applyFillSafely(node: SceneNode, color: RGB | RGBA, opacity?: number) {
  // Garantir que fills seja sempre um array válido
  if (!('fills' in node)) return;
  
  const fill: SolidPaint = { 
    type: 'SOLID', 
    color: { r: color.r, g: color.g, b: color.b } 
  };
  
  // Aplicar opacidade se fornecida
  if (opacity !== undefined && opacity !== 1) {
    fill.opacity = opacity;
  }
  
  node.fills = [fill];
}

/**
 * Cria um retângulo com propriedades específicas
 */
export function createRectangle(width: number, height: number, options: {
  color?: RGB | RGBA,
  cornerRadius?: number,
  stroke?: RGB | RGBA,
  strokeWeight?: number
} = {}): RectangleNode {
  const rect = figma.createRectangle();
  rect.resize(width, height);
  
  if (options.color) {
    applyFillSafely(rect, options.color);
  }
  
  if (options.cornerRadius !== undefined) {
    rect.cornerRadius = options.cornerRadius;
  }
  
  if (options.stroke) {
    rect.strokes = [{ 
      type: 'SOLID', 
      color: { 
        r: options.stroke.r, 
        g: options.stroke.g, 
        b: options.stroke.b 
      } 
    }];
    rect.strokeWeight = options.strokeWeight || 1;
  }
  
  return rect;
}

/**
 * Converte uma cor CSS para o formato Figma
 */
export function cssColorToFigmaColor(cssColor: string): RGB | RGBA | null {
  // Hex
  if (cssColor.startsWith('#')) {
    let hex = cssColor.substring(1);
    
    // Converter #RGB para #RRGGBB
    if (hex.length === 3) {
      hex = hex.split('').map(h => h + h).join('');
    }
    
    // Extrair componentes RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Extrair alpha se disponível (#RRGGBBAA)
    let a = 1;
    if (hex.length === 8) {
      a = parseInt(hex.substring(6, 8), 16) / 255;
    }
    
    return a < 1 ? { r, g, b, a } : { r, g, b };
  }
  
  // RGB/RGBA
  if (cssColor.startsWith('rgb')) {
    const values = cssColor.match(/\d+(\.\d+)?/g);
    
    if (values && values.length >= 3) {
      const r = parseInt(values[0]) / 255;
      const g = parseInt(values[1]) / 255;
      const b = parseInt(values[2]) / 255;
      const a = values.length === 4 ? parseFloat(values[3]) : 1;
      
      return a < 1 ? { r, g, b, a } : { r, g, b };
    }
  }
  
  // Cores nomeadas comuns
  const namedColors: Record<string, RGB> = {
    'white': { r: 1, g: 1, b: 1 },
    'black': { r: 0, g: 0, b: 0 },
    'red': { r: 1, g: 0, b: 0 },
    'green': { r: 0, g: 0.8, b: 0 },
    'blue': { r: 0, g: 0, b: 1 },
    'yellow': { r: 1, g: 1, b: 0 },
    'gray': { r: 0.5, g: 0.5, b: 0.5 },
    'transparent': { r: 0, g: 0, b: 0 }
  };
  
  return namedColors[cssColor.toLowerCase()];
}
import { parse } from 'node-html-parser';
import { QuasarNode } from '../types/settings';

/**
 * Extrai o conteúdo do template de um componente Vue
 */
export function extractTemplateContent(code: string): string {
  const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
  
  if (!templateMatch) {
    throw new Error("Não foi possível encontrar a seção <template> no código");
  }
  
  return templateMatch[1].trim();
}

/**
 * Analisa um template HTML e retorna uma árvore de nós Quasar
 */
export function parseQuasarTemplate(html: string): QuasarNode {
  try {
    // Usar node-html-parser para analisar o HTML
    const root = parse(html, {
      lowerCaseTagName: true,
      comment: false,
      blockTextElements: {
        script: true,
        noscript: true,
        style: true,
        pre: true
      }
    });
    
    // Encontrar o primeiro elemento real (ignorando texto puro)
    const firstElement = findFirstElement(root);
    if (!firstElement) {
      throw new Error('Não foi possível encontrar um elemento raiz válido');
    }
    
    return convertToQuasarNode(firstElement);
  } catch (error) {
    console.error('Erro ao analisar template HTML:', error);
    throw new Error(`Falha ao analisar o template HTML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Encontra o primeiro elemento não-texto em um nó
 */
function findFirstElement(node: any): any {
  if (!node) return null;
  
  if (node.childNodes && node.childNodes.length > 0) {
    for (const child of node.childNodes) {
      if (child.nodeType === 1) { // Elemento
        return child;
      }
    }
  }
  
  return node.firstChild; // Fallback
}

/**
 * Converte um nó da AST para o formato QuasarNode
 */
function convertToQuasarNode(node: any): QuasarNode {
  // Verificar se o nó é válido
  if (!node) {
    throw new Error('Nó inválido: nulo ou indefinido');
  }
  
  // Tratar nós de texto
  if (node.nodeType === 3) {
    return {
      tagName: '#text',
      attributes: {},
      childNodes: [],
      text: node.text ? node.text.trim() : ''
    };
  }
  
  // Processar atributos
  const attributes: Record<string, string> = {};
  if (node.attributes) {
    Object.entries(node.attributes).forEach(([key, value]) => {
      attributes[key] = value as string;
    });
  }
  
  // Processar atributos especiais do Vue
  // Converte v-bind:prop ou :prop para prop como atributo
  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith('v-bind:') || key.startsWith(':')) {
      const propName = key.startsWith(':') ? key.substring(1) : key.substring(7);
      attributes[propName] = value;
    }
  }
  
  // Processar filhos recursivamente
  const childNodes: QuasarNode[] = [];
  if (node.childNodes && node.childNodes.length > 0) {
    node.childNodes.forEach((child: any) => {
      // Ignorar nós de texto vazios
      if (child.nodeType === 3 && (!child.text || !child.text.trim())) {
        return;
      }
      
      try {
        const quasarChild = convertToQuasarNode(child);
        childNodes.push(quasarChild);
      } catch (error) {
        console.warn('Erro ao converter nó filho:', error);
      }
    });
  }
  
  // Construir o nó Quasar
  return {
    tagName: node.tagName ? node.tagName.toLowerCase() : '#unknown',
    attributes,
    childNodes,
    text: node.text ? node.text.trim() : undefined
  };
}

/**
 * Gera uma representação em texto da estrutura do nó para debug
 */
export function generateNodeStructure(node: QuasarNode, level: number = 0): string {
  const indent = '  '.repeat(level);
  let result = `${indent}${node.tagName}`;
  
  // Adicionar atributos
  if (Object.keys(node.attributes).length > 0) {
    const attrString = Object.entries(node.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    result += ` (${attrString})`;
  }
  
  result += '\n';
  
  // Adicionar texto se existir
  if (node.text) {
    result += `${indent}  "${node.text}"\n`;
  }
  
  // Processar filhos recursivamente
  for (const child of node.childNodes) {
    result += generateNodeStructure(child, level + 1);
  }
  
  return result;
}

/**
 * Encontra o primeiro nó com a tag especificada
 */
export function findNodeByTag(rootNode: QuasarNode, tagName: string): QuasarNode | null {
  if (rootNode.tagName.toLowerCase() === tagName.toLowerCase()) {
    return rootNode;
  }
  
  for (const child of rootNode.childNodes) {
    const result = findNodeByTag(child, tagName);
    if (result) {
      return result;
    }
  }
  
  return null;
}

/**
 * Encontra todos os nós com a tag especificada
 */
export function findNodesByTag(rootNode: QuasarNode, tagName: string): QuasarNode[] {
  const results: QuasarNode[] = [];
  
  if (rootNode.tagName.toLowerCase() === tagName.toLowerCase()) {
    results.push(rootNode);
  }
  
  for (const child of rootNode.childNodes) {
    const childResults = findNodesByTag(child, tagName);
    results.push(...childResults);
  }
  
  return results;
}
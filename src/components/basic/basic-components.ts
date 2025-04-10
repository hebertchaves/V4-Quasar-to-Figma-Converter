// src/components/basic/basic-components.ts
import { QuasarNode, PluginSettings } from '../../types/settings';
import { processButtonComponent } from './button-component';
import { processChipComponent } from './chip-component';
import { processSeparatorComponent } from './separator-component';
import { processIconComponent } from './icon-component';

/**
 * Processa componentes básicos do Quasar
 */
export async function processBasicComponents(node: QuasarNode, componentType: string, settings: PluginSettings): Promise<FrameNode> {
  switch(componentType) {
    case 'btn':
      return await processButtonComponent(node, settings);
    case 'chip':
      return await processChipComponent(node, settings);
    case 'separator':
      return await processSeparatorComponent(node, settings) as unknown as FrameNode;
    case 'icon':
      return await processIconComponent(node, settings);
    default:
      // Componente genérico
      const frame = figma.createFrame();
      frame.name = `basic-${componentType}`;
      frame.layoutMode = "VERTICAL";
      frame.primaryAxisSizingMode = "AUTO";
      frame.counterAxisSizingMode = "AUTO";
      return frame;
  }
}
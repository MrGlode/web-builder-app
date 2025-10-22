// src/app/features/api-orchestrator/models/block-definitions.ts

import { BlockDefinition } from './orchestrator.model';

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    id: 'trigger',
    type: 'trigger',
    name: 'Trigger',
    description: 'Point de départ',
    icon: '▶️',
    color: '#8B5CF6'
  },
  {
    id: 'api-call',
    type: 'api-call',
    name: 'API Call',
    description: 'Appeler une API',
    icon: '🌐',
    color: '#3B82F6'
  },
  {
    id: 'condition',
    type: 'condition',
    name: 'Condition',
    description: 'Branchement',
    icon: '🔀',
    color: '#F59E0B'
  },
  {
    id: 'transform',
    type: 'transform',
    name: 'Transform',
    description: 'Transformer les données',
    icon: '🔄',
    color: '#10B981'
  },
  {
    id: 'loop',
    type: 'loop',
    name: 'Loop',
    description: 'Boucle sur un tableau',
    icon: '🔁',
    color: '#EC4899'
  }
];

export function getBlockDefinition(id: string): BlockDefinition | undefined {
  return BLOCK_DEFINITIONS.find(b => b.id === id);
}
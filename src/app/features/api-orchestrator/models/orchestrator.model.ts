// src/app/features/api-orchestrator/models/orchestrator.model.ts

/**
 * Types de blocs
 */
export type BlockType = 'api-call' | 'condition' | 'loop' | 'transform' | 'trigger';

/**
 * Définition d'un bloc (template)
 */
export interface BlockDefinition {
  id: string;
  type: BlockType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Instance d'un bloc dans le canvas
 */
export interface Block {
  id: string;
  definitionId: string;
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number; };
}

/**
 * Une orchestration = collection de blocs
 */
export interface Orchestration {
  id: string;
  name: string;
  blocks: Block[];
}
// src/app/features/api-orchestrator/models/orchestrator.model.ts

/**
 * Types de blocs disponibles
 */
export type BlockType = 'api-call' | 'condition' | 'loop' | 'transform' | 'trigger';

/**
 * Paramètre d'entrée/sortie d'un bloc
 */
export interface BlockPort {
  id: string;
  name: string;
  type: 'input' | 'output';
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  description?: string;
}

/**
 * Définition d'un bloc (template réutilisable)
 */
export interface BlockDefinition {
  id: string;
  type: BlockType;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  inputs: BlockPort[];
  outputs: BlockPort[];
  config?: Record<string, any>; // Configuration spécifique au type
}

/**
 * Instance d'un bloc dans l'orchestration
 */
export interface OrchestrationBlock {
  id: string;
  definitionId: string;
  type: BlockType;
  name: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  inputs: Map<string, any>;
  outputs: Map<string, any>;
}

/**
 * Connexion entre deux blocs
 */
export interface Connection {
  id: string;
  sourceBlockId: string;
  sourcePortId: string;
  targetBlockId: string;
  targetPortId: string;
}

/**
 * Orchestration complète
 */
export interface ApiOrchestration {
  id: string;
  name: string;
  description?: string;
  blocks: OrchestrationBlock[];
  connections: Connection[];
  entryPointBlockId?: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

/**
 * Résultat d'exécution
 */
export interface ExecutionResult {
  blockId: string;
  status: 'pending' | 'running' | 'success' | 'error';
  data?: any;
  error?: string;
  executedAt?: Date;
}
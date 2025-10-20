// src/app/features/api-orchestrator/services/orchestrator-graph.service.ts

import { Injectable, signal, computed } from '@angular/core';
import {
  ApiOrchestration,
  OrchestrationBlock,
  Connection,
  BlockDefinition
} from '../models/orchestrator.model';
import { getBlockDefinition } from '../models/block-definitions';

@Injectable({
  providedIn: 'root'
})
export class OrchestratorGraphService {
  
  // État réactif de l'orchestration actuelle
  private orchestration = signal<ApiOrchestration | null>(null);
  private selectedBlockId = signal<string | null>(null);

  // Signaux computés
  blocks = computed(() => this.orchestration()?.blocks ?? []);
  connections = computed(() => this.orchestration()?.connections ?? []);
  selectedBlock = computed(() => {
    const blocks = this.blocks();
    const id = this.selectedBlockId();
    return id ? blocks.find(b => b.id === id) : null;
  });

  /**
   * Crée une nouvelle orchestration vierge
   */
  createNewOrchestration(name: string, description?: string): void {
    const newOrch: ApiOrchestration = {
      id: this.generateId(),
      name,
      description,
      blocks: [],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0'
    };
    this.orchestration.set(newOrch);
  }

  /**
   * Charge une orchestration existante
   */
  loadOrchestration(orch: ApiOrchestration): void {
    this.orchestration.set({ ...orch });
  }

  /**
   * Ajoute un nouveau bloc à l'orchestration
   */
  addBlock(
    definitionId: string,
    name: string,
    position: { x: number; y: number }
  ): string {
    const definition = getBlockDefinition(definitionId);
    if (!definition) throw new Error(`Block definition not found: ${definitionId}`);

    const orch = this.orchestration();
    if (!orch) throw new Error('No orchestration loaded');

    const blockId = this.generateId();
    const newBlock: OrchestrationBlock = {
      id: blockId,
      definitionId,
      type: definition.type,
      name,
      position: { x: Math.round(position.x), y: Math.round(position.y) },
      config: {},
      inputs: new Map(),
      outputs: new Map()
    };

    orch.blocks.push(newBlock);
    console.log('Block added:', newBlock);
    this.updateOrchestration();
    return blockId;
  }

  /**
   * Supprime un bloc et toutes ses connexions
   */
  removeBlock(blockId: string): void {
    const orch = this.orchestration();
    if (!orch) return;

    // Supprimer le bloc
    orch.blocks = orch.blocks.filter(b => b.id !== blockId);

    // Supprimer toutes les connexions liées
    orch.connections = orch.connections.filter(
      c => c.sourceBlockId !== blockId && c.targetBlockId !== blockId
    );

    if (this.selectedBlockId() === blockId) {
      this.selectedBlockId.set(null);
    }

    this.updateOrchestration();
  }

  /**
   * Déplace un bloc
   */
  moveBlock(blockId: string, position: { x: number; y: number }): void {
    const block = this.blocks().find(b => b.id === blockId);
    if (block) {
      block.position = position;
      this.updateOrchestration();
    }
  }

  /**
   * Met à jour la configuration d'un bloc
   */
  updateBlockConfig(blockId: string, config: Record<string, any>): void {
    const block = this.blocks().find(b => b.id === blockId);
    if (block) {
      block.config = { ...block.config, ...config };
      this.updateOrchestration();
    }
  }

  /**
   * Crée une connexion entre deux ports
   */
  createConnection(
    sourceBlockId: string,
    sourcePortId: string,
    targetBlockId: string,
    targetPortId: string
  ): string {
    const orch = this.orchestration();
    if (!orch) throw new Error('No orchestration loaded');

    // Validation basique
    if (!this.canConnect(sourceBlockId, sourcePortId, targetBlockId, targetPortId)) {
      throw new Error('Invalid connection');
    }

    const connectionId = this.generateId();
    const newConnection: Connection = {
      id: connectionId,
      sourceBlockId,
      sourcePortId,
      targetBlockId,
      targetPortId
    };

    orch.connections.push(newConnection);
    this.updateOrchestration();
    return connectionId;
  }

  /**
   * Supprime une connexion
   */
  removeConnection(connectionId: string): void {
    const orch = this.orchestration();
    if (!orch) return;

    orch.connections = orch.connections.filter(c => c.id !== connectionId);
    this.updateOrchestration();
  }

  /**
   * Obtient l'orchestration actuelle
   */
  getOrchestration(): ApiOrchestration | null {
    return this.orchestration();
  }

  /**
   * Sélectionne un bloc
   */
  selectBlock(blockId: string | null): void {
    this.selectedBlockId.set(blockId);
  }

  /**
   * Valide si une connexion est possible
   * (output vers input, types compatibles)
   */
  private canConnect(
    sourceBlockId: string,
    sourcePortId: string,
    targetBlockId: string,
    targetPortId: string
  ): boolean {
    // Pas de connexion sur soi-même
    if (sourceBlockId === targetBlockId) return false;

    const sourceBlock = this.blocks().find(b => b.id === sourceBlockId);
    const targetBlock = this.blocks().find(b => b.id === targetBlockId);

    if (!sourceBlock || !targetBlock) return false;

    const sourceDef = getBlockDefinition(sourceBlock.definitionId);
    const targetDef = getBlockDefinition(targetBlock.definitionId);

    if (!sourceDef || !targetDef) return false;

    const sourcePort = sourceDef.outputs.find(p => p.id === sourcePortId);
    const targetPort = targetDef.inputs.find(p => p.id === targetPortId);

    if (!sourcePort || !targetPort) return false;

    // Vérifier compatibilité des types
    return sourcePort.dataType === targetPort.dataType ||
           sourcePort.dataType === 'object' ||
           targetPort.dataType === 'object';
  }

  /**
   * Met à jour le timestamp de l'orchestration
   */
  private updateOrchestration(): void {
    const orch = this.orchestration();
    if (orch) {
      orch.updatedAt = new Date();
      // Force la réactivité en créant un nouveau tableau de blocs
      const updatedOrch = {
        ...orch,
        blocks: [...orch.blocks],
        connections: [...orch.connections]
      };
      this.orchestration.set(updatedOrch);
    }
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
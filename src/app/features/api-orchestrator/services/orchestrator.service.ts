// src/app/features/api-orchestrator/services/orchestrator.service.ts

import { Injectable, signal } from '@angular/core';
import { Orchestration, Block } from '../models/orchestrator.model';
import { getBlockDefinition } from '../models/block-definitions';

@Injectable({
  providedIn: 'root'
})
export class OrchestratorService {
  
  // État réactif
  private orchestration = signal<Orchestration>({
    id: this.generateId(),
    name: 'Nouvelle Orchestration',
    blocks: []
  });

  // Expose l'orchestration
  orchestration$ = this.orchestration;

  constructor() {}

  /**
   * Crée une nouvelle orchestration vierge
   */
  newOrchestration(name: string): void {
    this.orchestration.set({
      id: this.generateId(),
      name,
      blocks: []
    });
  }

  /**
   * Ajoute un bloc à l'orchestration
   */
  addBlock(definitionId: string, name: string): Block {
    const definition = getBlockDefinition(definitionId);
    if (!definition) throw new Error(`Block definition not found: ${definitionId}`);

    const orch = this.orchestration();
    const newBlock: Block = {
      id: this.generateId(),
      definitionId,
      name,
      config: {},
      position: { 
        x: 20 + (orch.blocks.length * 10),
        y: 20 + (orch.blocks.length * 10)
      }
    };

    orch.blocks.push(newBlock);
    this.orchestration.set({ ...orch });

    return newBlock;
  }

  /**
   * Supprime un bloc
   */
  removeBlock(blockId: string): void {
    const orch = this.orchestration();
    orch.blocks = orch.blocks.filter(b => b.id !== blockId);
    this.orchestration.set({ ...orch });
  }

  /**
   * Récupère un bloc par ID
   */
  getBlock(blockId: string): Block | undefined {
    return this.orchestration().blocks.find(b => b.id === blockId);
  }

  /**
   * Met à jour la position d'un bloc
   */
  updateBlockPosition(blockId: string, position: { x: number; y: number }): void {
    const orch = this.orchestration();
    const block = orch.blocks.find(b => b.id === blockId);
    if (block) {
      block.position = position;
      this.orchestration.set({ ...orch });
    }
  }

  updateBlockConfig(blockId: string, config: Record<string, any>): void {
    const orch = this.orchestration();
    const block = orch.blocks.find(b => b.id === blockId);
    if (block) {
      block.config = { ...block.config, ...config };
      this.orchestration.set({ ...orch });
    }
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
// src/app/features/api-orchestrator/services/orchestrator-validation.service.ts

import { Injectable } from '@angular/core';
import { ApiOrchestration, OrchestrationBlock } from '../models/orchestrator.model';
import { getBlockDefinition } from '../models/block-definitions';

export interface ValidationError {
  type: 'error' | 'warning';
  blockId?: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

@Injectable({
  providedIn: 'root'
})
export class OrchestratorValidationService {

  /**
   * Valide une orchestration complète
   */
  validate(orchestration: ApiOrchestration): ValidationResult {
    const errors: ValidationError[] = [];

    // Validation 1: Au moins un bloc
    if (orchestration.blocks.length === 0) {
      errors.push({
        type: 'error',
        message: 'L\'orchestration doit contenir au moins un bloc'
      });
    }

    // Validation 2: Au moins un point d'entrée (Trigger)
    const hasTrigger = orchestration.blocks.some(b => b.type === 'trigger');
    if (!hasTrigger) {
      errors.push({
        type: 'warning',
        message: 'Aucun bloc Trigger trouvé. L\'orchestration devrait commencer par un trigger'
      });
    }

    // Validation 3: Vérifier chaque bloc
    orchestration.blocks.forEach(block => {
      const blockErrors = this.validateBlock(block, orchestration);
      errors.push(...blockErrors);
    });

    // Validation 4: Vérifier les connexions
    const connectionErrors = this.validateConnections(orchestration);
    errors.push(...connectionErrors);

    return {
      isValid: errors.filter(e => e.type === 'error').length === 0,
      errors
    };
  }

  /**
   * Valide un bloc individuel
   */
  private validateBlock(block: OrchestrationBlock, orchestration: ApiOrchestration): ValidationError[] {
    const errors: ValidationError[] = [];
    const definition = getBlockDefinition(block.definitionId);

    if (!definition) {
      errors.push({
        type: 'error',
        blockId: block.id,
        message: `Définition de bloc non trouvée: ${block.definitionId}`
      });
      return errors;
    }

    // Vérifier les entrées requises
    definition.inputs.forEach(inputPort => {
      if (inputPort.required) {
        const isConnected = orchestration.connections.some(
          c => c.targetBlockId === block.id && c.targetPortId === inputPort.id
        );
        const hasValue = block.config[inputPort.id] !== undefined;

        if (!isConnected && !hasValue) {
          errors.push({
            type: 'error',
            blockId: block.id,
            message: `Le port d'entrée "${inputPort.name}" est requis pour le bloc "${block.name}"`
          });
        }
      }
    });

    // Vérifier les ports de sortie connectés
    definition.outputs.forEach(outputPort => {
      const isConnected = orchestration.connections.some(
        c => c.sourceBlockId === block.id && c.sourcePortId === outputPort.id
      );

      if (!isConnected && block.type !== 'trigger') {
        errors.push({
          type: 'warning',
          blockId: block.id,
          message: `Le port de sortie "${outputPort.name}" n'est connecté à rien`
        });
      }
    });

    return errors;
  }

  /**
   * Valide les connexions
   */
  private validateConnections(orchestration: ApiOrchestration): ValidationError[] {
    const errors: ValidationError[] = [];

    orchestration.connections.forEach(connection => {
      const sourceBlock = orchestration.blocks.find(b => b.id === connection.sourceBlockId);
      const targetBlock = orchestration.blocks.find(b => b.id === connection.targetBlockId);

      if (!sourceBlock || !targetBlock) {
        errors.push({
          type: 'error',
          message: `Connexion invalide: bloc source ou cible manquant`
        });
        return;
      }

      // Vérifier que la cible n'ait pas déjà une connexion sur ce port d'entrée
      const duplicateConnections = orchestration.connections.filter(
        c => c.targetBlockId === connection.targetBlockId &&
             c.targetPortId === connection.targetPortId
      );

      if (duplicateConnections.length > 1) {
        errors.push({
          type: 'warning',
          blockId: targetBlock.id,
          message: `Le port d'entrée a plusieurs connexions. Seule la dernière sera utilisée.`
        });
      }
    });

    return errors;
  }

  /**
   * Vérifie s'il y a des cycles dans le graphe
   */
  hasCycle(orchestration: ApiOrchestration): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (blockId: string): boolean => {
      visited.add(blockId);
      recursionStack.add(blockId);

      const connections = orchestration.connections.filter(
        c => c.sourceBlockId === blockId
      );

      for (const conn of connections) {
        const nextBlockId = conn.targetBlockId;

        if (!visited.has(nextBlockId)) {
          if (this.hasCycle(orchestration)) return true;
        } else if (recursionStack.has(nextBlockId)) {
          return true;
        }
      }

      recursionStack.delete(blockId);
      return false;
    };

    for (const block of orchestration.blocks) {
      if (!visited.has(block.id)) {
        if (dfs(block.id)) return true;
      }
    }

    return false;
  }
}
// src/app/features/api-orchestrator/services/orchestrator-execution.service.ts

import { Injectable, signal } from '@angular/core';
import { ApiOrchestration, ExecutionResult, OrchestrationBlock } from '../models/orchestrator.model';
import { getBlockDefinition } from '../models/block-definitions';

@Injectable({
  providedIn: 'root'
})
export class OrchestratorExecutionService {

  // État de l'exécution
  private executionResults = signal<Map<string, ExecutionResult>>(new Map());
  private isRunning = signal<boolean>(false);

  constructor() {} // Injection du HttpClient si nécessaire

  /**
   * Récupère les résultats d'exécution
   */
  getExecutionResults() {
    return this.executionResults();
  }

  /**
   * Vérifie si une exécution est en cours
   */
  getIsRunning() {
    return this.isRunning();
  }

  /**
   * Lance l'exécution d'une orchestration
   */
  async execute(
    orchestration: ApiOrchestration,
    inputData?: Record<string, any>
  ): Promise<void> {
    this.isRunning.set(true);
    this.executionResults.set(new Map());

    try {
      // Trouver le bloc trigger
      const triggerBlock = orchestration.blocks.find(b => b.type === 'trigger');
      if (!triggerBlock) {
        throw new Error('Aucun bloc Trigger trouvé');
      }

      await this.executeBlock(triggerBlock, orchestration, inputData || {});
    } catch (error) {
      console.error('Erreur d\'exécution:', error);
    } finally {
      this.isRunning.set(false);
    }
  }

  /**
   * Exécute un bloc spécifique et ses descendants
   */
  private async executeBlock(
    block: OrchestrationBlock,
    orchestration: ApiOrchestration,
    inputData: Record<string, any>
  ): Promise<any> {
    const result: ExecutionResult = {
      blockId: block.id,
      status: 'running',
      executedAt: new Date()
    };

    this.updateResult(block.id, result);

    try {
      let outputData: any;

      // Exécuter selon le type de bloc
      switch (block.type) {
        case 'trigger':
          outputData = await this.executeTrigger(block, inputData);
          break;
        case 'api-call':
          outputData = await this.executeApiCall(block, inputData);
          break;
        case 'condition':
          outputData = await this.executeCondition(block, orchestration, inputData);
          break;
        case 'transform':
          outputData = await this.executeTransform(block, inputData);
          break;
        case 'loop':
          outputData = await this.executeLoop(block, orchestration, inputData);
          break;
        default:
          throw new Error(`Type de bloc inconnu: ${block.type}`);
      }

      result.data = outputData;
      result.status = 'success';
      this.updateResult(block.id, result);

      // Exécuter les blocs connectés suivants
      await this.executeNext(block.id, orchestration, outputData);
    } catch (error) {
      result.status = 'error';
      result.error = error instanceof Error ? error.message : 'Erreur inconnue';
      this.updateResult(block.id, result);
    }
  }

  /**
   * Bloc Trigger: retourne simplement les données d'entrée
   */
  private async executeTrigger(
    block: OrchestrationBlock,
    inputData: Record<string, any>
  ): Promise<any> {
    return {
      triggerData: inputData
    };
  }

  /**
   * Bloc API Call: appelle une API HTTP
   */
  private async executeApiCall(
    block: OrchestrationBlock,
    inputData: Record<string, any>
  ): Promise<any> {
    const url = block.config['url'] || inputData['url'];
    const method = block.config['method'] || inputData['method'] || 'GET';
    const headers = block.config['headers'] || inputData['headers'] || {};
    const body = block.config['body'] || inputData['body'];

    if (!url) throw new Error('URL requise pour l\'appel API');

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const responseData = await response.json();
      return {
        response: responseData,
        status: response.status
      };
    } catch (error) {
      throw new Error(`Erreur API: ${error}`);
    }
  }

  /**
   * Bloc Condition: exécute un chemin ou l'autre selon la condition
   */
  private async executeCondition(
    block: OrchestrationBlock,
    orchestration: ApiOrchestration,
    inputData: Record<string, any>
  ): Promise<any> {
    const condition = block.config['condition'] !== false && inputData['condition'];

    // Retourner l'indicateur du chemin à suivre
    return {
      condition,
      path: condition ? 'true-path' : 'false-path'
    };
  }

  /**
   * Bloc Transform: transforme les données
   */
  private async executeTransform(
    block: OrchestrationBlock,
    inputData: Record<string, any>
  ): Promise<any> {
    const data = inputData['input-data'] || inputData;
    const transformation = block.config['transformation'];

    if (!transformation) return data;

    // Appliquer les transformations (simplifié ici)
    try {
      return this.applyTransformation(data, transformation);
    } catch (error) {
      throw new Error(`Erreur de transformation: ${error}`);
    }
  }

  /**
   * Bloc Loop: boucle sur un tableau
   */
  private async executeLoop(
    block: OrchestrationBlock,
    orchestration: ApiOrchestration,
    inputData: Record<string, any>
  ): Promise<any> {
    const array = inputData['array'] || [];
    const results: any[] = [];

    for (const item of array) {
      // Exécuter les blocs connectés pour chaque item
      const itemResult = await this.executeNext(
        block.id,
        orchestration,
        { item }
      );
      results.push(itemResult);
    }

    return { results };
  }

  /**
   * Exécute les blocs suivants connectés au bloc courant
   */
  private async executeNext(
    sourceBlockId: string,
    orchestration: ApiOrchestration,
    outputData: any
  ): Promise<any> {
    const connections = orchestration.connections.filter(
      c => c.sourceBlockId === sourceBlockId
    );

    let lastResult: any;

    for (const connection of connections) {
      const nextBlock = orchestration.blocks.find(b => b.id === connection.targetBlockId);
      if (nextBlock) {
        lastResult = await this.executeBlock(nextBlock, orchestration, outputData);
      }
    }

    return lastResult;
  }

  /**
   * Applique une transformation aux données
   */
  private applyTransformation(data: any, transformation: any): any {
    // Implémentation simple de transformation
    // Peut être étendue pour supporter JSONPath, Jolt, etc.
    if (typeof transformation === 'function') {
      return transformation(data);
    }
    return { ...data, ...transformation };
  }

  /**
   * Met à jour les résultats d'exécution
   */
  private updateResult(blockId: string, result: ExecutionResult): void {
    const results = new Map(this.executionResults());
    results.set(blockId, result);
    this.executionResults.set(results);
  }

  /**
   * Réinitialise les résultats
   */
  resetResults(): void {
    this.executionResults.set(new Map());
  }
}
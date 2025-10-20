// src/app/features/api-orchestrator/api-orchestrator.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrchestratorGraphService } from './services/orchestrator-graph.service';
import { OrchestratorValidationService } from './services/orchestrator-validation.service';
import { OrchestratorExecutionService } from './services/orchestrator-execution.service';
import { BlockPaletteComponent } from './components/block-palette/block-palette.component';
import { DesignerCanvasComponent } from './components/designer-canvas/designer-canvas.component';
import { ConfigPanelComponent } from './components/config-panel/config-panel.component';

interface ValidationMessage {
  type: 'error' | 'warning';
  message: string;
}

@Component({
  selector: 'app-api-orchestrator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BlockPaletteComponent,
    DesignerCanvasComponent,
    ConfigPanelComponent
  ],
  templateUrl: './api-orchestrator.component.html',
  styleUrls: ['./api-orchestrator.component.scss']
})
export class ApiOrchestratorComponent implements OnInit {
  orchestrationName = 'Nouvelle Orchestration';
  validationMessages: ValidationMessage[] = [];
  isExecuting = false;

  constructor(
    private graphService: OrchestratorGraphService,
    private validationService: OrchestratorValidationService,
    private executionService: OrchestratorExecutionService
  ) {}

  ngOnInit(): void {
    // Créer une orchestration vierge
    this.graphService.createNewOrchestration(this.orchestrationName);
  }

  onBlockSelected(blockDef: any): void {
    // Le bloc a été sélectionné de la palette
    // On attend qu'il soit droppé sur le canvas
  }

  onBlockDropped(event: any): void {
    // Ajouter le bloc au graphe
    try {
      console.log('Block dropped event:', event);
      
      const blockId = this.graphService.addBlock(
        event.definitionId,
        event.name,
        event.position
      );
      
      console.log('Block added with ID:', blockId);
      
      // Sélectionner automatiquement le bloc ajouté
      this.graphService.selectBlock(blockId);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bloc:', error);
      alert('Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  }

  onBlockMoved(event: any): void {
    this.graphService.moveBlock(event.blockId, event.position);
  }

  onConnectionCreated(event: any): void {
    this.graphService.createConnection(
      event.sourceBlockId,
      event.sourcePortId,
      event.targetBlockId,
      event.targetPortId
    );
  }

  onConnectionRemoved(event: any): void {
    this.graphService.removeConnection(event.connectionId);
  }

  onCanvasBlockSelected(blockId: string | null): void {
    this.graphService.selectBlock(blockId);
  }

  onConfigUpdated(event: any): void {
    this.graphService.updateBlockConfig(event.blockId, event.config);
  }

  onValidate(): void {
    const orch = this.graphService.getOrchestration();
    if (!orch) return;

    const result = this.validationService.validate(orch);
    this.validationMessages = result.errors;

    if (result.isValid) {
      alert('✓ Orchestration valide !');
    }
  }

  async onExecute(): Promise<void> {
    const orch = this.graphService.getOrchestration();
    if (!orch) return;

    // Valider avant d'exécuter
    const validation = this.validationService.validate(orch);
    if (!validation.isValid) {
      alert('⚠ Orchestration invalide. Veuillez corriger les erreurs.');
      return;
    }

    this.isExecuting = true;
    await this.executionService.execute(orch);
    this.isExecuting = false;

    // Afficher les résultats
    const results = this.executionService.getExecutionResults();
    console.log('Résultats d\'exécution:', results);
  }
}
// src/app/features/api-orchestrator/components/canvas/canvas.component.ts

import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrchestratorService } from '../../../services/orchestrator.service';
import { getBlockDefinition } from '../../../models/block-definitions';
import { Block } from '../../../models/orchestrator.model';

@Component({
  selector: 'app-orch-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent {
  // Expose Object au template
  Object = Object;
  
  private orchService = inject(OrchestratorService);

  // Output pour notifier le parent
  blockSelected = output<Block | null>();

  // Expose l'orchestration pour le template
  orchestration = this.orchService.orchestration$;
  
  selectedBlockId: string | null = null;
  
  // State pour le drag
  private draggedBlockId: string | null = null;
  private dragStartPos: { x: number; y: number } | null = null;

  /**
   * Dragover sur le canvas
   */
  onCanvasDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('🔵 Dragover canvas');

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  /**
   * Drop sur le canvas
   */
  onCanvasDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('🟢 Drop canvas');

    if (!event.dataTransfer) return;

    const blockDefinitionId = event.dataTransfer.getData('blockDefinitionId');
    if (!blockDefinitionId) {
      console.error('❌ No blockDefinitionId');
      return;
    }

    try {
      const definition = getBlockDefinition(blockDefinitionId);
      if (!definition) {
        console.error('❌ Definition not found:', blockDefinitionId);
        return;
      }

      console.log('✅ Adding block:', definition.name);
      const newBlock = this.orchService.addBlock(blockDefinitionId, definition.name);
      this.selectedBlockId = newBlock.id;
      this.blockSelected.emit(newBlock);  // ← AJOUTE CET EMIT !
      console.log('✅ Block added:', newBlock.id);
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }

  /**
   * Sélectionne un bloc
   */
  selectBlock(blockId: string): void {
    this.selectedBlockId = blockId;
    const block = this.orchService.getBlock(blockId);
    this.blockSelected.emit(block || null);
    console.log('✏️ Block selected:', blockId);
  }

  /**
   * Supprime un bloc
   */
  deleteBlock(blockId: string, event: Event): void {
    event.stopPropagation();
    this.orchService.removeBlock(blockId);
    if (this.selectedBlockId === blockId) {
      this.selectedBlockId = null;
    }
    console.log('Bloc supprimé:', blockId);
  }

  /**
   * Démarre le drag d'un bloc
   */
  onBlockMouseDown(blockId: string, event: MouseEvent): void {
    event.preventDefault();
    this.draggedBlockId = blockId;
    this.dragStartPos = { x: event.clientX, y: event.clientY };
    console.log('Drag started:', blockId);
  }

  /**
   * Déplace le bloc pendant le drag
   */
  onMouseMove(event: MouseEvent): void {
    if (!this.draggedBlockId || !this.dragStartPos) return;

    const block = this.orchService.getBlock(this.draggedBlockId);
    if (!block) return;

    const deltaX = event.clientX - this.dragStartPos.x;
    const deltaY = event.clientY - this.dragStartPos.y;

    const newPosition = {
      x: Math.max(0, block.position.x + deltaX),
      y: Math.max(0, block.position.y + deltaY)
    };

    this.orchService.updateBlockPosition(this.draggedBlockId, newPosition);
    this.dragStartPos = { x: event.clientX, y: event.clientY };
  }

  /**
   * Termine le drag
   */
  onMouseUp(): void {
    if (this.draggedBlockId) {
      console.log('Drag ended:', this.draggedBlockId);
    }
    this.draggedBlockId = null;
    this.dragStartPos = null;
  }

  /**
   * Récupère la couleur d'un bloc
   */
  getBlockColor(blockDefinitionId: string): string {
    const def = getBlockDefinition(blockDefinitionId);
    return def?.color || '#999';
  }

  /**
   * Récupère l'icône d'un bloc
   */
  getBlockIcon(blockDefinitionId: string): string {
    const def = getBlockDefinition(blockDefinitionId);
    return def?.icon || '🔹';
  }

  /**
   * Récupère le nom du type de bloc
   */
  getBlockTypeName(blockDefinitionId: string): string {
    const def = getBlockDefinition(blockDefinitionId);
    return def?.type || 'unknown';
  }
}
// src/app/features/api-orchestrator/components/block-palette/block-palette.component.ts

import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BLOCK_DEFINITIONS } from '../../models/block-definitions';
import { BlockDefinition } from '../../models/orchestrator.model';

@Component({
  selector: 'app-block-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './block-palette.component.html',
  styleUrls: ['./block-palette.component.scss']
})
export class BlockPaletteComponent {
  @Output() blockSelected = new EventEmitter<any>();

  BLOCK_DEFINITIONS = BLOCK_DEFINITIONS;
  searchTerm = '';
  filteredBlocks: BlockDefinition[] = [];

  getBlocksByType(type: string): BlockDefinition[] {
    return BLOCK_DEFINITIONS.filter(b => b.type === type);
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'api-call': '🌐',
      'condition': '🔀',
      'loop': '🔁',
      'transform': '🔄',
      'trigger': '▶️'
    };
    return icons[type] || '🔹';
  }

  onSearchChange(): void {
    if (!this.searchTerm) {
      this.filteredBlocks = [];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredBlocks = BLOCK_DEFINITIONS.filter(
      b => b.name.toLowerCase().includes(term) ||
           b.description.toLowerCase().includes(term)
    );
  }

  onDragStart(event: DragEvent, block: BlockDefinition): void {
    console.log('🟡 Dragstart on block:', block.name);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      // Stocker les données du bloc comme dans le visual builder
      event.dataTransfer.setData('blockDefinitionId', block.id);
      event.dataTransfer.setData('blockName', block.name);
      console.log('✅ Data set in dataTransfer:', { id: block.id, name: block.name });

      // Ajouter une classe visuelle
      const target = event.target as HTMLElement;
      target.classList.add('dragging');
    } else {
      console.error('❌ No dataTransfer available');
    }

    this.blockSelected.emit(block);
  }

  onDragEnd(event: DragEvent): void {
    const target = event.target as HTMLElement;
    target.classList.remove('dragging');
  }
}
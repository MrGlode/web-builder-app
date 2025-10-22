// src/app/features/api-orchestrator/components/palette/palette.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BLOCK_DEFINITIONS } from '../../models/block-definitions';

@Component({
  selector: 'app-orch-palette',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './palette.component.html',
  styleUrls: ['./palette.component.scss']
})
export class PaletteComponent {
  blocks = BLOCK_DEFINITIONS;

  onDragStart(event: DragEvent, blockId: string): void {
    console.log('🟡 Dragstart palette:', blockId);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
      event.dataTransfer.setData('blockDefinitionId', blockId);
    }
  }
}
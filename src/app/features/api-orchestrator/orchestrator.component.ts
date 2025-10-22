// src/app/features/api-orchestrator/orchestrator.component.ts

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaletteComponent } from './components/palette/palette.component';
import { CanvasComponent } from './components/palette/canvas/canvas.component';
import { ConfigPanelComponent } from './components/palette/config-panel/config-panel.component';
import { Block } from './models/orchestrator.model';

@Component({
  selector: 'app-orchestrator',
  standalone: true,
  imports: [CommonModule, FormsModule, PaletteComponent, CanvasComponent, ConfigPanelComponent],
  templateUrl: './orchestrator.component.html',
  styleUrls: ['./orchestrator.component.scss']
})
export class OrchestratorComponent {
  title = 'Nouvelle Orchestration';
  
  // Bloc sélectionné (signal)
  selectedBlock = signal<Block | null>(null);

  /**
   * Reçoit le bloc sélectionné du canvas
   */
  onBlockSelected(block: Block | null): void {
    this.selectedBlock.set(block);
    console.log('📌 Block selected in main:', block?.id);
  }
}
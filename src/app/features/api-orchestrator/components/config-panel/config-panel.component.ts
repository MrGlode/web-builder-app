// src/app/features/api-orchestrator/components/config-panel/config-panel.component.ts

import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrchestratorGraphService } from '../../services/orchestrator-graph.service';
import { getBlockDefinition } from '../../models/block-definitions';

@Component({
  selector: 'app-config-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-panel.component.html',
  styleUrls: ['./config-panel.component.scss']
})
export class ConfigPanelComponent {
  @Output() configUpdated = new EventEmitter<any>();

  activeTab: 'inputs' | 'config' | 'info' = 'config';

  constructor(private graphService: OrchestratorGraphService) {}

  get selectedBlock() {
    return this.graphService.selectedBlock;
  }

  onConfigChange(key: string, event: Event): void {
    const block = this.selectedBlock();
    if (!block) return;

    const value = (event.target as HTMLInputElement).value;
    this.configUpdated.emit({
      blockId: block.id,
      config: { [key]: value }
    });
  }

  onNameChange(event: Event): void {
    const block = this.selectedBlock();
    if (!block) return;

    const value = (event.target as HTMLInputElement).value;
    block.name = value;
  }

  getBlockInputs(): any[] {
    const block = this.selectedBlock();
    if (!block) return [];

    const definition = getBlockDefinition(block.definitionId);
    return definition?.inputs || [];
  }

  getBlockDefinition() {
    const block = this.selectedBlock();
    if (!block) return null;

    return getBlockDefinition(block.definitionId);
  }

  getBlockType(definitionId?: string): string {
    if (!definitionId) return '';

    const definition = getBlockDefinition(definitionId);
    return definition?.type || '';
  }

  getConfigValue(key: string): string {
    const block = this.selectedBlock();
    if (!block) return '';

    return block.config[key] || '';
  }
}
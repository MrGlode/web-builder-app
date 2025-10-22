// src/app/features/api-orchestrator/components/config-panel/config-panel.component.ts

import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Block } from '../../../models/orchestrator.model';
import { OrchestratorService } from '../../../services/orchestrator.service';
import { getBlockDefinition } from '../../../models/block-definitions';

@Component({
  selector: 'app-orch-config-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-panel.component.html',
  styleUrls: ['./config-panel.component.scss']
})
export class ConfigPanelComponent {
  // Expose Object au template
  Object = Object;
  
  private orchService = inject(OrchestratorService);

  // Input : bloc sélectionné
  selectedBlock = input<Block | null>(null);

  /**
   * Met à jour le nom du bloc
   */
  updateBlockName(newName: string): void {
    const block = this.selectedBlock();
    if (!block) return;

    block.name = newName;
    this.orchService.updateBlockConfig(block.id, {});
    console.log('✏️ Block name updated:', newName);
  }

  /**
   * Met à jour une propriété de config
   */
  updateBlockProperty(key: string, value: string): void {
    const block = this.selectedBlock();
    if (!block) return;

    this.orchService.updateBlockConfig(block.id, { [key]: value });
    console.log('✏️ Block property updated:', key, value);
  }

  /**
   * Ajoute une nouvelle propriété
   */
  addProperty(propertyName: string): void {
    if (!propertyName || propertyName.trim() === '') return;

    const block = this.selectedBlock();
    if (!block) return;

    this.orchService.updateBlockConfig(block.id, { [propertyName]: '' });
    console.log('➕ Property added:', propertyName);
  }

  /**
   * Supprime une propriété
   */
  deleteProperty(key: string): void {
    const block = this.selectedBlock();
    if (!block) return;

    const config = { ...block.config };
    delete config[key];
    
    // Reconstituer un nouvel objet pour la réactivité
    this.orchService.updateBlockConfig(block.id, config);
    console.log('🗑️ Property deleted:', key);
  }

  /**
   * Récupère le type de bloc
   */
  getBlockType(): string {
    const block = this.selectedBlock();
    if (!block) return '';
    const def = getBlockDefinition(block.definitionId);
    return def?.type || 'unknown';
  }

  /**
   * Récupère la couleur du bloc
   */
  getBlockColor(): string {
    const block = this.selectedBlock();
    if (!block) return '#999';
    const def = getBlockDefinition(block.definitionId);
    return def?.color || '#999';
  }
}
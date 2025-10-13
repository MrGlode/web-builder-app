// src/app/features/visual-builder/components/history-timeline/history-timeline.component.ts

import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryService } from '../../services/history.service';
import { VisualBuilderService } from '../../services/visual-builder.service';
import { HistoryAction, ActionType } from '../../models/history.model';

@Component({
  selector: 'app-history-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-timeline.component.html',
  styleUrls: ['./history-timeline.component.scss']
})
export class HistoryTimelineComponent {
  historyService = inject(HistoryService);
  builderService = inject(VisualBuilderService);

  // Expose les données
  actions = this.historyService.visibleActions;
  stats = computed(() => this.historyService.getStats());
  canUndo = this.builderService.canUndo;
  canRedo = this.builderService.canRedo;

  // État UI
  isExpanded = true;

  /**
   * Obtient l'icône pour un type d'action
   */
  getActionIcon(type: ActionType): string {
    const icons: Record<ActionType, string> = {
      [ActionType.ADD_COMPONENT]: '➕',
      [ActionType.REMOVE_COMPONENT]: '🗑️',
      [ActionType.UPDATE_COMPONENT]: '✏️',
      [ActionType.MOVE_COMPONENT]: '↔️',
      [ActionType.DUPLICATE_COMPONENT]: '📋'
    };
    return icons[type] || '📝';
  }

  /**
   * Obtient la classe CSS pour un type d'action
   */
  getActionClass(type: ActionType): string {
    const classes: Record<ActionType, string> = {
      [ActionType.ADD_COMPONENT]: 'action-add',
      [ActionType.REMOVE_COMPONENT]: 'action-remove',
      [ActionType.UPDATE_COMPONENT]: 'action-update',
      [ActionType.MOVE_COMPONENT]: 'action-move',
      [ActionType.DUPLICATE_COMPONENT]: 'action-duplicate'
    };
    return classes[type] || 'action-default';
  }

  /**
   * Formate le timestamp en heure
   */
  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Retourne à une action spécifique
   */
  goToAction(actionId: string) {
    this.historyService.goToAction(actionId);
  }

  /**
   * Undo
   */
  undo() {
    this.builderService.undo();
  }

  /**
   * Redo
   */
  redo() {
    this.builderService.redo();
  }

  /**
   * Efface l'historique
   */
  clearHistory() {
    if (confirm('Effacer tout l\'historique ?')) {
      this.historyService.clear();
    }
  }

  /**
   * Toggle expand/collapse
   */
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
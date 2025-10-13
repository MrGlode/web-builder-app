// src/app/features/visual-builder/services/history.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { HistoryAction, ActionType, HistoryConfig } from '../models/history.model';
import { BuilderComponent } from '../models/component.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  
  // Configuration par défaut
  private config: Required<HistoryConfig> = {
    maxHistorySize: 50,
    enableTimeline: true,
    autosaveInterval: 0
  };

  // État de l'historique
  private actions = signal<HistoryAction[]>([]);
  private currentIndex = signal<number>(-1);

  // Signals computés
  canUndo = computed(() => this.currentIndex() > 0);
  canRedo = computed(() => this.currentIndex() < this.actions().length - 1);
  
  // Historique visible (jusqu'à currentIndex)
  visibleActions = computed(() => 
    this.actions().slice(0, this.currentIndex() + 1)
  );

  /**
   * Configure le service d'historique
   */
  configure(config: Partial<HistoryConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Enregistre une nouvelle action
   */
  recordAction(
    type: ActionType,
    description: string,
    beforeState?: HistoryAction['beforeState'],
    afterState?: HistoryAction['afterState']
  ): void {
    const action: HistoryAction = {
      id: this.generateId(),
      type,
      timestamp: Date.now(),
      description,
      beforeState,
      afterState
    };

    // Supprimer les actions après l'index actuel (si on fait une nouvelle action après un undo)
    const newActions = this.actions().slice(0, this.currentIndex() + 1);
    
    // Ajouter la nouvelle action
    newActions.push(action);

    // Limiter la taille de l'historique
    if (newActions.length > this.config.maxHistorySize) {
      newActions.shift(); // Supprimer la plus ancienne
    } else {
      this.currentIndex.update(index => index + 1);
    }

    this.actions.set(newActions);
  }

  /**
   * Annule la dernière action (Undo)
   */
  undo(): HistoryAction | null {
    if (!this.canUndo()) {
      return null;
    }

    const action = this.actions()[this.currentIndex()];
    this.currentIndex.update(index => index - 1);
    
    return action;
  }

  /**
   * Refait la dernière action annulée (Redo)
   */
  redo(): HistoryAction | null {
    if (!this.canRedo()) {
      return null;
    }

    this.currentIndex.update(index => index + 1);
    const action = this.actions()[this.currentIndex()];
    
    return action;
  }

  /**
   * Retourne à une action spécifique dans l'historique
   */
  goToAction(actionId: string): HistoryAction | null {
    const index = this.actions().findIndex(a => a.id === actionId);
    if (index === -1) {
      return null;
    }

    this.currentIndex.set(index);
    return this.actions()[index];
  }

  /**
   * Efface tout l'historique
   */
  clear(): void {
    this.actions.set([]);
    this.currentIndex.set(-1);
  }

  /**
   * Obtient l'action courante
   */
  getCurrentAction(): HistoryAction | null {
    const index = this.currentIndex();
    if (index < 0 || index >= this.actions().length) {
      return null;
    }
    return this.actions()[index];
  }

  /**
   * Obtient toutes les actions
   */
  getAllActions(): HistoryAction[] {
    return this.actions();
  }

  /**
   * Obtient les statistiques de l'historique
   */
  getStats() {
    return {
      totalActions: this.actions().length,
      currentIndex: this.currentIndex(),
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    };
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
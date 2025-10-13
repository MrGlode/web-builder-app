// src/app/features/visual-builder/models/history.model.ts

import { BuilderComponent } from './component.model';

/**
 * Types d'actions possibles dans l'historique
 */
export enum ActionType {
  ADD_COMPONENT = 'ADD_COMPONENT',
  REMOVE_COMPONENT = 'REMOVE_COMPONENT',
  UPDATE_COMPONENT = 'UPDATE_COMPONENT',
  MOVE_COMPONENT = 'MOVE_COMPONENT',
  DUPLICATE_COMPONENT = 'DUPLICATE_COMPONENT'
}

/**
 * Action enregistrée dans l'historique
 */
export interface HistoryAction {
  id: string;                    // ID unique de l'action
  type: ActionType;              // Type d'action
  timestamp: number;             // Timestamp de l'action
  description: string;           // Description lisible
  
  // État avant l'action (pour undo)
  beforeState?: {
    component?: BuilderComponent;
    parentId?: string;
    index?: number;
  };
  
  // État après l'action (pour redo)
  afterState?: {
    component?: BuilderComponent;
    parentId?: string;
    index?: number;
  };
}

/**
 * État complet de l'historique
 */
export interface HistoryState {
  actions: HistoryAction[];      // Liste de toutes les actions
  currentIndex: number;          // Index de l'action courante
  maxHistorySize: number;        // Taille maximale de l'historique
}

/**
 * Configuration de l'historique
 */
export interface HistoryConfig {
  maxHistorySize?: number;       // Nombre max d'actions (défaut: 50)
  enableTimeline?: boolean;      // Activer la timeline UI
  autosaveInterval?: number;     // Intervalle d'autosave en ms (0 = désactivé)
}
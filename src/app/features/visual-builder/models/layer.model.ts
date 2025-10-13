export interface LayerState {
  id: string;              // ID du composant
  isExpanded: boolean;     // Dossier ouvert/fermé
  isVisible: boolean;      // Visibilité du composant
  isLocked: boolean;       // Verrouillage du composant
}

/**
 * Options de vue du panneau Layers
 */
export interface LayersViewOptions {
  showHidden: boolean;     // Afficher les composants cachés
  showLocked: boolean;     // Afficher les composants verrouillés
  autoExpand: boolean;     // Expansion automatique lors de la sélection
  sortMode: 'order' | 'name' | 'type';  // Mode de tri
}

/**
 * Configuration du drag & drop dans les layers
 */
export interface LayerDragConfig {
  allowDragToRoot: boolean;      // Autoriser le drag vers la racine
  allowDragBetweenParents: boolean;  // Autoriser le changement de parent
  showDropIndicator: boolean;    // Afficher l'indicateur de drop
}

/**
 * Action sur un layer
 */
export interface LayerAction {
  type: 'select' | 'toggle-visibility' | 'toggle-lock' | 'delete' | 'duplicate';
  componentId: string;
}
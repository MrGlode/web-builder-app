// src/app/features/visual-builder/models/layer-group.model.ts

/**
 * Représente un calque (layer/groupe) dans le builder
 * Similaire aux calques de Photoshop/Figma
 */
export interface LayerGroup {
  /** ID unique du calque */
  id: string;
  
  /** Nom du calque */
  name: string;
  
  /** Couleur d'identification (pour l'UI) */
  color?: string;
  
  /** Ordre d'affichage (plus petit = plus bas) */
  order: number;
  
  /** Visibilité du calque */
  isVisible: boolean;
  
  /** Verrouillage du calque */
  isLocked: boolean;
  
  /** Opacité du calque (0-100) */
  opacity: number;
  
  /** Mode de fusion (optionnel, pour features avancées) */
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  
  /** Description optionnelle */
  description?: string;
  
  /** Métadonnées */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configuration d'affichage des calques
 */
export interface LayerGroupsViewConfig {
  /** Afficher les calques masqués */
  showHiddenLayers: boolean;
  
  /** Afficher les calques verrouillés */
  showLockedLayers: boolean;
  
  /** Afficher le nombre de composants par calque */
  showComponentCount: boolean;
  
  /** Mode de tri */
  sortMode: 'order' | 'name' | 'created';
}

/**
 * Statistiques d'un calque
 */
export interface LayerGroupStats {
  /** ID du calque */
  layerId: string;
  
  /** Nombre de composants dans ce calque */
  componentCount: number;
  
  /** Nombre de composants visibles */
  visibleCount: number;
  
  /** Nombre de composants verrouillés */
  lockedCount: number;
}

/**
 * Action sur un calque
 */
export interface LayerGroupAction {
  type: 'create' | 'delete' | 'rename' | 'toggle-visibility' | 'toggle-lock' | 'reorder' | 'merge';
  layerId: string;
  data?: any;
}

/**
 * Options de création d'un nouveau calque
 */
export interface CreateLayerOptions {
  /** Nom du calque (généré si non fourni) */
  name?: string;
  
  /** Couleur du calque */
  color?: string;
  
  /** Position dans la liste (par défaut: en haut) */
  order?: number;
  
  /** Créer visible ou masqué */
  isVisible?: boolean;
  
  /** Créer verrouillé ou non */
  isLocked?: boolean;
}
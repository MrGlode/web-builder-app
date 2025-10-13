// src/app/features/visual-builder/models/page.model.ts

import { BuilderComponent } from './component.model';

/**
 * Mode de vue pour le builder
 */
export type ViewMode = 'desktop' | 'tablet' | 'mobile';

/**
 * Métadonnées SEO d'une page
 */
export interface PageMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

/**
 * Configuration responsive d'une page
 */
export interface ResponsiveConfig {
  mobile: {
    enabled: boolean;
    breakpoint: number; // en pixels
  };
  tablet: {
    enabled: boolean;
    breakpoint: number;
  };
  desktop: {
    enabled: boolean;
    breakpoint: number;
  };
}

/**
 * Paramètres d'une page
 */
export interface PageSettings {
  // Layout général
  layout: {
    maxWidth?: string;
    backgroundColor?: string;
    fontFamily?: string;
    fontSize?: string;
  };
  
  // Responsive
  responsive: ResponsiveConfig;
  
  // Scripts personnalisés
  customScripts?: {
    head?: string;
    body?: string;
  };
  
  // Styles personnalisés
  customStyles?: string;
}

/**
 * Modèle d'une page
 */
export interface Page {
  // Identifiant unique
  id: string;
  
  // Nom de la page
  name: string;
  
  // Route/URL de la page
  route: string;
  
  // Composants de la page
  components: BuilderComponent[];
  
  // Métadonnées
  metadata: PageMetadata;
  
  // Paramètres
  settings: PageSettings;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  
  // Statut
  status: 'draft' | 'published' | 'archived';
  
  // Version
  version: number;
}

/**
 * Historique d'une page (pour undo/redo)
 */
export interface PageHistory {
  pageId: string;
  snapshots: PageSnapshot[];
  currentIndex: number;
}

/**
 * Snapshot d'une page à un instant T
 */
export interface PageSnapshot {
  timestamp: Date;
  components: BuilderComponent[];
  action: string; // Description de l'action
}
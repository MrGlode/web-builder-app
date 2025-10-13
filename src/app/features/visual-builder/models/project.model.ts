// src/app/features/visual-builder/models/project.model.ts

import { Page } from './page.model';

/**
 * Type de projet
 */
export type ProjectType =
  | 'client-portal'      // Espace client
  | 'subscription'       // Site de souscription
  | 'claims'            // Déclaration de sinistres
  | 'website'           // Site web classique
  | 'landing-page'      // Landing page
  | 'custom';           // Personnalisé

/**
 * Configuration du projet
 */
export interface ProjectConfig {
  // Domaine
  domain?: string;
  subdomain?: string;
  
  // Thème
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  
  // Internationalisation
  i18n: {
    defaultLanguage: string;
    supportedLanguages: string[];
  };
  
  // SEO global
  seo: {
    siteName: string;
    defaultTitle: string;
    defaultDescription: string;
    favicon?: string;
    logo?: string;
  };
  
  // Analytics
  analytics?: {
    googleAnalyticsId?: string;
    customScripts?: string[];
  };
}

/**
 * Paramètres de déploiement
 */
export interface DeploymentSettings {
  // Environnements
  environments: {
    development?: {
      url: string;
      apiUrl: string;
    };
    staging?: {
      url: string;
      apiUrl: string;
    };
    production?: {
      url: string;
      apiUrl: string;
    };
  };
  
  // CI/CD
  autoDeploy: boolean;
  deploymentProvider?: 'vercel' | 'netlify' | 'aws' | 'custom';
  
  // Build settings
  buildCommand?: string;
  outputDirectory?: string;
}

/**
 * Modèle d'un projet
 */
export interface Project {
  // Identifiant unique
  id: string;
  
  // Informations générales
  name: string;
  description: string;
  type: ProjectType;
  
  // Pages du projet
  pages: Page[];
  
  // Configuration
  config: ProjectConfig;
  
  // Paramètres de déploiement
  deployment: DeploymentSettings;
  
  // Propriétaire
  ownerId: string;
  ownerEmail: string;
  
  // Collaborateurs
  collaborators?: {
    userId: string;
    email: string;
    role: 'owner' | 'editor' | 'viewer';
  }[];
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  lastPublishedAt?: Date;
  
  // Statut
  status: 'active' | 'archived';
  
  // Version
  version: string;
}

/**
 * Résumé d'un projet (pour les listes)
 */
export interface ProjectSummary {
  id: string;
  name: string;
  type: ProjectType;
  pageCount: number;
  updatedAt: Date;
  status: 'active' | 'archived';
  thumbnail?: string;
}
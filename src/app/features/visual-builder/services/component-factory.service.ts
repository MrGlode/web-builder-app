// src/app/features/visual-builder/services/component-factory.service.ts

import { Injectable } from '@angular/core';
import { BuilderComponent, ComponentType, ComponentCategory } from '../models/component.model';
import { COMPONENT_CATALOG } from '../config/component-definitions';

/**
 * Service pour créer des instances de composants BuilderComponent
 */
@Injectable({
  providedIn: 'root'
})
export class ComponentFactoryService {
  
  /**
   * Crée un nouveau composant à partir de son type
   */
  createComponent(type: ComponentType, parentId?: string): BuilderComponent {
    // Trouver la définition du composant
    const definition = this.findComponentDefinition(type);
    
    if (!definition) {
      console.error(`❌ Définition introuvable pour le type: ${type}`);
      throw new Error(`Component type "${type}" not found in catalog`);
    }
    
    // Générer un ID unique
    const id = this.generateId();
    
    // Créer le composant
    const component: BuilderComponent = {
      id,
      type,
      category: definition.category,
      displayName: definition.displayName,
      properties: {
        content: definition.defaultProperties.content || {},
        styles: definition.defaultProperties.styles || {},
        attributes: definition.defaultProperties.attributes || {},
        events: definition.defaultProperties.events
      },
      parentId,
      order: 0,
      isLocked: false,
      isHidden: false,
      isSelected: false
    };
    
    // Ajouter le tableau children si le composant peut en avoir
    if (definition.canHaveChildren) {
      component.children = [];
    }
    
    console.log('✨ Composant créé:', component);
    
    return component;
  }
  
  /**
   * Trouve la définition d'un composant dans le catalogue
   */
  private findComponentDefinition(type: ComponentType) {
    // Parcourir toutes les catégories du catalogue
    for (const category in COMPONENT_CATALOG) {
      const definitions = COMPONENT_CATALOG[category as ComponentCategory];
      const found = definitions.find(def => def.type === type);
      if (found) {
        return found;
      }
    }
    return null;
  }
  
  /**
   * Duplique un composant existant
   */
  duplicateComponent(component: BuilderComponent): BuilderComponent {
    const duplicate = structuredClone(component);
    
    // Générer de nouveaux IDs pour le composant et ses enfants
    duplicate.id = this.generateId();
    duplicate.displayName = `${component.displayName} (copie)`;
    duplicate.isSelected = false;
    
    if (duplicate.children) {
      duplicate.children = duplicate.children.map(child => 
        this.duplicateComponent(child)
      );
    }
    
    return duplicate;
  }
  
  /**
   * Génère un ID unique pour un composant
   */
  public generateId(): string {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Vérifie si un type de composant existe
   */
  componentTypeExists(type: ComponentType): boolean {
    return this.findComponentDefinition(type) !== null;
  }
  
  /**
   * Obtient la définition d'un composant
   */
  getComponentDefinition(type: ComponentType) {
    return this.findComponentDefinition(type);
  }
}
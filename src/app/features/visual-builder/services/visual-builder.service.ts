// src/app/features/visual-builder/services/visual-builder.service.ts
// Service pour gérer les opérations sur les composants avec historique

import { Injectable, signal, computed, inject } from '@angular/core';
import { BuilderComponent } from '../models/component.model';
import { HistoryService } from './history.service';
import { ActionType } from '../models/history.model';

@Injectable({
  providedIn: 'root'
})
export class VisualBuilderService {
  private historyService = inject(HistoryService);

  // État des composants de la page courante
  private components = signal<BuilderComponent[]>([]);
  private selectedComponentId = signal<string | null>(null);

  // Signals computés
  allComponents = computed(() => this.components());
  selectedComponent = computed(() => {
    const id = this.selectedComponentId();
    return id ? this.findComponentById(id) : null;
  });

  // Expose les signals d'historique
  canUndo = this.historyService.canUndo;
  canRedo = this.historyService.canRedo;

  /**
   * Initialise le service avec une liste de composants
   */
  setComponents(components: BuilderComponent[]): void {
    this.components.set(components);
  }

  /**
   * Obtient tous les composants
   */
  getComponents(): BuilderComponent[] {
    return this.components();
  }

  /**
   * Ajoute un composant (avec historique)
   */
  addComponent(component: BuilderComponent, parentId?: string): void {
    // Enregistrer l'action AVANT la modification
    this.historyService.recordAction(
      ActionType.ADD_COMPONENT,
      `Ajout ${component.displayName}`,
      undefined,
      { component, parentId }
    );

    if (parentId) {
      this.addChildToParent(parentId, component);
    } else {
      this.components.update(comps => [...comps, component]);
    }
  }

  /**
   * Supprime un composant (avec historique)
   */
  removeComponent(componentId: string): void {
    const component = this.findComponentById(componentId);
    if (!component) return;

    const parentId = this.findParentId(componentId);
    const index = this.findComponentIndex(componentId, parentId);

    // Enregistrer l'action AVANT la suppression
    this.historyService.recordAction(
      ActionType.REMOVE_COMPONENT,
      `Suppression ${component.displayName}`,
      { component, parentId: parentId ?? undefined, index },
      undefined
    );

    if (parentId) {
      this.removeChildFromParent(parentId, componentId);
    } else {
      this.components.update(comps => 
        comps.filter(c => c.id !== componentId)
      );
    }

    // Désélectionner si c'était le composant sélectionné
    if (this.selectedComponentId() === componentId) {
      this.selectComponent(null);
    }
  }

  /**
   * Met à jour un composant (avec historique)
   */
  updateComponent(componentId: string, updates: Partial<BuilderComponent>): void {
    const component = this.findComponentById(componentId);
    if (!component) return;

    // Cloner l'état avant
    const beforeComponent = structuredClone(component);

    // Appliquer les modifications
    Object.assign(component, updates);

    // Enregistrer l'action
    this.historyService.recordAction(
      ActionType.UPDATE_COMPONENT,
      `Modification ${component.displayName}`,
      { component: beforeComponent },
      { component: structuredClone(component) }
    );

    // Forcer le signal à se mettre à jour
    this.components.update(comps => [...comps]);
  }

  /**
   * Déplace un composant (avec historique)
   */
  moveComponent(componentId: string, newParentId: string | null, newIndex: number): void {
    const component = this.findComponentById(componentId);
    if (!component) return;

    const oldParentId = this.findParentId(componentId);
    const oldIndex = this.findComponentIndex(componentId, oldParentId);

    // Enregistrer l'action
    this.historyService.recordAction(
      ActionType.MOVE_COMPONENT,
      `Déplacement ${component.displayName}`,
      { component, parentId: oldParentId ?? undefined, index: oldIndex },
      { component, parentId: newParentId ?? undefined, index: newIndex }
    );

    // Effectuer le déplacement
    if (oldParentId) {
      this.removeChildFromParent(oldParentId, componentId);
    } else {
      this.components.update(comps => 
        comps.filter(c => c.id !== componentId)
      );
    }
    
    if (newParentId) {
      this.addChildToParent(newParentId, component, newIndex);
    } else {
      this.components.update(comps => {
        const newComps = [...comps];
        newComps.splice(newIndex, 0, component);
        return newComps;
      });
    }
  }

  /**
   * Annule la dernière action (Undo)
   */
  undo(): void {
    const action = this.historyService.undo();
    if (!action) return;

    // Appliquer l'état "avant"
    if (action.beforeState) {
      this.applyHistoryState(action.beforeState, action.type);
    }
  }

  /**
   * Refait la dernière action annulée (Redo)
   */
  redo(): void {
    const action = this.historyService.redo();
    if (!action) return;

    // Appliquer l'état "après"
    if (action.afterState) {
      this.applyHistoryState(action.afterState, action.type);
    }
  }

  /**
   * Applique un état depuis l'historique
   */
  private applyHistoryState(
    state: { component?: BuilderComponent; parentId?: string; index?: number },
    actionType: ActionType
  ): void {
    if (!state.component) return;

    const { component, parentId, index } = state;

    switch (actionType) {
      case ActionType.ADD_COMPONENT:
        // Si c'est un undo d'ajout -> supprimer sans historique
        this.removeComponentDirect(component.id);
        break;

      case ActionType.REMOVE_COMPONENT:
        // Si c'est un undo de suppression -> ré-ajouter sans historique
        this.addComponentDirect(component, parentId, index);
        break;

      case ActionType.UPDATE_COMPONENT:
        // Remplacer le composant par l'état précédent
        this.replaceComponentDirect(component);
        break;

      case ActionType.MOVE_COMPONENT:
        // Déplacer le composant à son ancienne position
        this.moveComponentDirect(component.id, parentId ?? null, index);
        break;
    }
  }

  /**
   * Sélectionne un composant
   */
  selectComponent(componentId: string | null): void {
    this.selectedComponentId.set(componentId);
  }

  /**
   * Efface tout
   */
  clear(): void {
    this.components.set([]);
    this.selectedComponentId.set(null);
    this.historyService.clear();
  }

  // ===== MÉTHODES UTILITAIRES PRIVÉES =====

  private findComponentById(id: string): BuilderComponent | null {
    const find = (components: BuilderComponent[]): BuilderComponent | null => {
      for (const comp of components) {
        if (comp.id === id) return comp;
        if (comp.children) {
          const found = find(comp.children);
          if (found) return found;
        }
      }
      return null;
    };
    return find(this.components());
  }

  private findParentId(childId: string): string | null {
    const find = (components: BuilderComponent[]): string | null => {
      for (const comp of components) {
        if (comp.children?.some(c => c.id === childId)) {
          return comp.id;
        }
        if (comp.children) {
          const found = find(comp.children);
          if (found) return found;
        }
      }
      return null;
    };
    return find(this.components());
  }

  private findComponentIndex(componentId: string, parentId: string | null): number {
    if (parentId) {
      const parent = this.findComponentById(parentId);
      return parent?.children?.findIndex(c => c.id === componentId) ?? -1;
    }
    return this.components().findIndex(c => c.id === componentId);
  }

  private addChildToParent(parentId: string, child: BuilderComponent, index?: number): void {
    this.components.update(comps => {
      const parent = this.findComponentById(parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        if (index !== undefined) {
          parent.children.splice(index, 0, child);
        } else {
          parent.children.push(child);
        }
      }
      return [...comps];
    });
  }

  private removeChildFromParent(parentId: string, childId: string): void {
    this.components.update(comps => {
      const parent = this.findComponentById(parentId);
      if (parent?.children) {
        parent.children = parent.children.filter(c => c.id !== childId);
      }
      return [...comps];
    });
  }

  // Méthodes directes (sans enregistrer dans l'historique)
  
  private addComponentDirect(component: BuilderComponent, parentId?: string, index?: number): void {
    if (parentId) {
      this.addChildToParent(parentId, component, index);
    } else {
      this.components.update(comps => {
        const newComps = [...comps];
        if (index !== undefined) {
          newComps.splice(index, 0, component);
        } else {
          newComps.push(component);
        }
        return newComps;
      });
    }
  }

  private removeComponentDirect(componentId: string): void {
    const parentId = this.findParentId(componentId);
    if (parentId) {
      this.removeChildFromParent(parentId, componentId);
    } else {
      this.components.update(comps => comps.filter(c => c.id !== componentId));
    }
  }

  private replaceComponentDirect(component: BuilderComponent): void {
    this.components.update(comps => {
      const replace = (components: BuilderComponent[]): BuilderComponent[] => {
        return components.map(c => {
          if (c.id === component.id) {
            return component;
          }
          if (c.children) {
            return { ...c, children: replace(c.children) };
          }
          return c;
        });
      };
      return replace(comps);
    });
  }

  private moveComponentDirect(componentId: string, newParentId: string | null, newIndex?: number): void {
    const component = this.findComponentById(componentId);
    if (!component) return;

    this.removeComponentDirect(componentId);
    this.addComponentDirect(component, newParentId ?? undefined, newIndex);
  }
}
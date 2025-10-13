// src/app/features/visual-builder/components/builder-canvas/builder-canvas.component.ts

import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuilderComponent } from '../../models/component.model';
import { ViewMode } from '../../models/page.model';

@Component({
  selector: 'app-builder-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './builder-canvas.component.html',
  styleUrls: ['./builder-canvas.component.scss']
})
export class BuilderCanvasComponent {
  
  // ===== INPUTS =====
  
  /** Liste des composants à afficher */
  components = input<BuilderComponent[]>([]);
  
  /** ID du composant sélectionné */
  selectedComponentId = input<string | null>(null);
  
  /** Mode de vue actuel */
  viewMode = input<ViewMode>('desktop');
  
  /** Niveau de zoom */
  zoomLevel = input<number>(100);
  
  // ===== OUTPUTS =====
  
  /** Émis quand un composant est sélectionné */
  componentSelected = output<BuilderComponent>();
  
  /** Émis quand un composant est droppé sur le canvas */
  componentDropped = output<{ componentType: string; parentId?: string; index?: number }>();
  
  /** Émis quand un composant est survolé */
  componentHovered = output<string | null>();
  
  // ===== STATE =====
  
  /** ID du composant survolé */
  private hoveredComponentId = signal<string | null>(null);
  
  /** État du drag en cours */
  private isDragging = signal(false);
  
  /** Type de composant en cours de drag */
  private draggedComponentType = signal<string | null>(null);
  
  /** Zone de drop active */
  private activeDropZone = signal<string | null>(null);
  
  // ===== COMPUTED =====
  
  /** Indique si on est en train de dragger */
  canvasDragging = computed(() => this.isDragging());
  
  /** Obtient le composant survolé */
  hoveredComponent = computed(() => {
    const id = this.hoveredComponentId();
    return id ? this.findComponentById(id) : null;
  });
  
  // ===== LIFECYCLE =====
  
  ngOnInit() {
    console.log('🎨 Builder Canvas initialisé');
  }
  
  // ===== MÉTHODES - Sélection =====
  
  /**
   * Sélectionne un composant
   */
  selectComponent(component: BuilderComponent, event: Event) {
    event.stopPropagation();
    this.componentSelected.emit(component);
  }
  
  /**
   * Vérifie si un composant est sélectionné
   */
  isSelected(component: BuilderComponent): boolean {
    return this.selectedComponentId() === component.id;
  }
  
  /**
   * Vérifie si un composant est survolé
   */
  isHovered(component: BuilderComponent): boolean {
    return this.hoveredComponentId() === component.id;
  }
  
  // ===== MÉTHODES - Hover =====
  
  /**
   * Gère le survol d'un composant
   */
  onComponentMouseEnter(component: BuilderComponent, event: Event) {
    event.stopPropagation();
    this.hoveredComponentId.set(component.id);
    this.componentHovered.emit(component.id);
  }
  
  /**
   * Gère la sortie du survol
   */
  onComponentMouseLeave(component: BuilderComponent, event: Event) {
    event.stopPropagation();
    if (this.hoveredComponentId() === component.id) {
      this.hoveredComponentId.set(null);
      this.componentHovered.emit(null);
    }
  }
  
  // ===== MÉTHODES - Drag & Drop =====
  
  /**
   * Gère le dragover sur le canvas
   */
  onCanvasDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    
    this.isDragging.set(true);
  }
  
  /**
   * Gère le dragleave du canvas
   */
  onCanvasDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    // Vérifier qu'on sort vraiment du canvas
    const target = event.target as HTMLElement;
    if (target.classList.contains('canvas-content')) {
      this.isDragging.set(false);
      this.activeDropZone.set(null);
    }
  }
  
  /**
   * Gère le drop sur le canvas (racine)
   */
  onCanvasDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!event.dataTransfer) return;
    
    const componentType = event.dataTransfer.getData('componentType');
    
    if (componentType) {
      console.log('📦 Drop sur le canvas (racine):', componentType);
      
      this.componentDropped.emit({
        componentType,
        parentId: undefined,
        index: this.components().length
      });
    }
    
    this.isDragging.set(false);
    this.draggedComponentType.set(null);
    this.activeDropZone.set(null);
  }
  
  /**
   * Gère le dragover sur un composant container
   */
  onContainerDragOver(event: DragEvent, component: BuilderComponent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    
    // Vérifier que le composant peut avoir des enfants
    if (this.canHaveChildren(component)) {
      this.activeDropZone.set(component.id);
    }
  }
  
  /**
   * Gère le drop sur un container
   */
  onContainerDrop(event: DragEvent, component: BuilderComponent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!event.dataTransfer) return;
    
    const componentType = event.dataTransfer.getData('componentType');
    
    if (componentType && this.canHaveChildren(component)) {
      console.log('📦 Drop dans container:', componentType, '→', component.displayName);
      
      this.componentDropped.emit({
        componentType,
        parentId: component.id,
        index: component.children?.length || 0
      });
    }
    
    this.activeDropZone.set(null);
  }
  
  /**
   * Vérifie si un composant peut avoir des enfants
   */
  canHaveChildren(component: BuilderComponent): boolean {
    // Types qui peuvent contenir des enfants
    const containerTypes = ['container', 'section', 'grid', 'flexbox', 'form', 'card', 'modal', 'hero'];
    return containerTypes.includes(component.type);
  }
  
  /**
   * Vérifie si une zone est active pour le drop
   */
  isDropZoneActive(componentId: string): boolean {
    return this.activeDropZone() === componentId;
  }
  
  // ===== MÉTHODES - Utilitaires =====
  
  /**
   * Trouve un composant par son ID (récursif)
   */
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
  
  /**
   * Obtient l'icône d'un composant
   */
  getComponentIcon(component: BuilderComponent): string {
    const icons: Record<string, string> = {
      'container': '📦',
      'section': '📄',
      'grid': '⊞',
      'flexbox': '⬌',
      'heading': '🔤',
      'paragraph': '📝',
      'button': '🔘',
      'input': '✏️',
      'image': '🖼️',
      'form': '📋',
      'card': '🃏',
      'modal': '🪟'
    };
    return icons[component.type] || '🧩';
  }
  
  /**
   * Désélectionne tout (clic sur le canvas vide)
   */
  onCanvasClick(event: Event) {
    // Si on clique sur le canvas lui-même (pas sur un composant)
    const target = event.target as HTMLElement;
    if (target.classList.contains('canvas-content')) {
      this.componentSelected.emit(null as any);
    }
  }
}
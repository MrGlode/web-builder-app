// src/app/features/visual-builder/components/builder-canvas/builder-canvas.component.ts

import { Component, input, output, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuilderComponent } from '../../models/component.model';
import { ViewMode } from '../../models/page.model';
import { MultiSelectionService } from '../../services/multi-selection.service';

@Component({
  selector: 'app-builder-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './builder-canvas.component.html',
  styleUrls: ['./builder-canvas.component.scss']
})
export class BuilderCanvasComponent {
  
  // ===== SERVICES =====
  
  private multiSelectionService = inject(MultiSelectionService);
  
  // ===== INPUTS =====
  
  /** Liste des composants à afficher */
  components = input<BuilderComponent[]>([]);
  
  /** ID du composant sélectionné (single selection - legacy) */
  selectedComponentId = input<string | null>(null);
  
  /** Mode de vue actuel */
  viewMode = input<ViewMode>('desktop');
  
  /** Niveau de zoom */
  zoomLevel = input<number>(100);
  
  // ===== OUTPUTS =====
  
  /** Émis quand un composant est sélectionné */
  componentSelected = output<BuilderComponent>();
  
  /** Émis quand plusieurs composants sont sélectionnés */
  componentsSelected = output<BuilderComponent[]>();
  
  /** Émis quand un composant est droppé sur le canvas */
  componentDropped = output<{ 
    componentType: string; 
    parentId?: string; 
    index?: number 
  }>();
  
  /** Émis quand un composant est survolé */
  componentHovered = output<string | null>();
  
  /** Émis quand les composants sélectionnés doivent être supprimés */
  componentsDeleted = output<string[]>();
  
  /** Émis quand les composants sélectionnés doivent être dupliqués */
  componentsDuplicated = output<BuilderComponent[]>();
  
  // ===== STATE =====
  
  /** ID du composant survolé */
  private hoveredComponentId = signal<string | null>(null);
  
  /** État du drag en cours */
  private isDragging = signal(false);
  
  /** Type de composant en cours de drag */
  private draggedComponentType = signal<string | null>(null);
  
  /** Zone de drop active */
  private activeDropZone = signal<string | null>(null);
  
  /** Mode de sélection visuelle (pour feedback UI) */
  private selectionFeedback = signal<'single' | 'multi' | 'range' | null>(null);
  
  // ===== COMPUTED (Multi-Selection) =====
  
  /** IDs des composants sélectionnés depuis le service */
  selectedIds = this.multiSelectionService.selectedComponentIds;
  
  /** Nombre de composants sélectionnés */
  selectionCount = this.multiSelectionService.selectionCount;
  
  /** A-t-on une sélection multiple ? */
  hasMultipleSelection = this.multiSelectionService.hasMultipleSelection;
  
  /** Mode de sélection actuel */
  currentSelectionMode = this.multiSelectionService.currentMode;
  
  /** Indique si on est en train de dragger */
  canvasDragging = computed(() => this.isDragging());
  
  /** Obtient le composant survolé */
  hoveredComponent = computed(() => {
    const id = this.hoveredComponentId();
    return id ? this.findComponentById(id) : null;
  });
  
  /** Info contextuelle pour l'UI */
  selectionInfo = computed(() => {
    const count = this.selectionCount();
    const mode = this.currentSelectionMode();
    
    if (count === 0) return 'Aucune sélection';
    if (count === 1) return '1 composant sélectionné';
    return `${count} composants sélectionnés (mode: ${mode})`;
  });
  
  // ===== LIFECYCLE =====
  
  ngOnInit() {
    console.log('🎨 Builder Canvas initialisé avec Multi-Selection');
  }
  
  // ===== MÉTHODES - Sélection (Améliorée) =====
  
  /**
   * Sélectionne un composant avec support multi-sélection
   * - Click simple : Sélection unique
   * - Ctrl+Click : Toggle dans sélection multiple
   * - Shift+Click : Sélection en plage
   */
  selectComponent(component: BuilderComponent, event: MouseEvent) {
    event.stopPropagation();
    
    // Déterminer le mode de sélection
    let mode: 'single' | 'multi' | 'range' = 'single';
    
    if (event.ctrlKey || event.metaKey) {
      mode = 'multi';
    } else if (event.shiftKey) {
      mode = 'range';
    }
    
    // Mise à jour visuelle du feedback
    this.selectionFeedback.set(mode);
    
    // Utiliser le service de multi-sélection
    this.multiSelectionService.select(
      component.id,
      mode,
      this.components()
    );
    
    // Émettre les événements
    this.componentSelected.emit(component);
    
    // Si multi-sélection, émettre aussi la liste complète
    if (this.hasMultipleSelection()) {
      const selected = this.multiSelectionService.getSelectedComponents(
        this.components()
      );
      this.componentsSelected.emit(selected);
    }
    
    console.log(`🖱️ Sélection ${mode}:`, component.displayName);
  }
  
  /**
   * Vérifie si un composant est sélectionné
   */
  isSelected(component: BuilderComponent): boolean {
    return this.multiSelectionService.isSelected(component.id);
  }
  
  /**
   * Vérifie si un composant est survolé
   */
  isHovered(component: BuilderComponent): boolean {
    return this.hoveredComponentId() === component.id;
  }
  
  /**
   * Désélectionne tout (clic sur le canvas vide)
   */
  onCanvasClick(event: MouseEvent) {
    // Seulement si on clique directement sur le canvas
    const target = event.target as HTMLElement;
    if (target.classList.contains('canvas-content') || 
        target.classList.contains('builder-canvas')) {
      this.multiSelectionService.clearSelection();
      this.selectionFeedback.set(null);
      this.componentSelected.emit(null as any);
      console.log('❌ Désélection totale');
    }
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
  
  // ===== RACCOURCIS CLAVIER =====
  
  /**
   * Gère les raccourcis clavier
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    // Ignorer si on est dans un input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }
    
    // Ctrl+A / Cmd+A : Tout sélectionner
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      this.selectAll();
    }
    
    // Escape : Désélectionner tout
    if (event.key === 'Escape') {
      event.preventDefault();
      this.clearSelection();
    }
    
    // Delete / Backspace : Supprimer la sélection
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.deleteSelected();
    }
    
    // Ctrl+D / Cmd+D : Dupliquer
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault();
      this.duplicateSelected();
    }
  }
  
  /**
   * Sélectionne tous les composants
   */
  selectAll(): void {
    const allIds = this.components().map(c => c.id);
    this.multiSelectionService.selectAll(allIds);
    this.selectionFeedback.set('multi');
    
    const selected = this.multiSelectionService.getSelectedComponents(
      this.components()
    );
    this.componentsSelected.emit(selected);
    
    console.log('✅ Tous les composants sélectionnés:', allIds.length);
  }
  
  /**
   * Désélectionne tout
   */
  clearSelection(): void {
    this.multiSelectionService.clearSelection();
    this.selectionFeedback.set(null);
    console.log('❌ Sélection effacée');
  }
  
  /**
   * Supprime les composants sélectionnés
   */
  deleteSelected(): void {
    const selectedIds = this.selectedIds();
    
    if (selectedIds.length === 0) {
      console.log('⚠️ Aucun composant à supprimer');
      return;
    }
    
    this.componentsDeleted.emit(selectedIds);
    this.multiSelectionService.clearSelection();
    
    console.log(`🗑️ Suppression de ${selectedIds.length} composant(s)`);
  }
  
  /**
   * Duplique les composants sélectionnés
   */
  duplicateSelected(): void {
    const selected = this.multiSelectionService.getSelectedComponents(
      this.components()
    );
    
    if (selected.length === 0) {
      console.log('⚠️ Aucun composant à dupliquer');
      return;
    }
    
    this.componentsDuplicated.emit(selected);
    console.log(`📋 Duplication de ${selected.length} composant(s)`);
  }
  
  // ===== MÉTHODES - Utilitaires =====
  
  /**
   * Vérifie si un composant peut avoir des enfants
   */
  canHaveChildren(component: BuilderComponent): boolean {
    const containerTypes = [
      'container', 'section', 'grid', 'flexbox', 
      'form', 'card', 'modal', 'tabs', 'accordion'
    ];
    return containerTypes.includes(component.type);
  }
  
  /**
   * Vérifie si une zone est active pour le drop
   */
  isDropZoneActive(componentId: string): boolean {
    return this.activeDropZone() === componentId;
  }
  
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
      'textarea': '📄',
      'select': '📋',
      'checkbox': '☑️',
      'radio': '🔘',
      'image': '🖼️',
      'video': '🎬',
      'icon': '⭐',
      'form': '📋',
      'card': '🃏',
      'modal': '🪟',
      'tabs': '📑',
      'accordion': '📂',
      'carousel': '🎠'
    };
    return icons[component.type] || '🧩';
  }
  
  /**
   * Obtient le badge de sélection
   */
  getSelectionBadge(component: BuilderComponent): string {
    if (!this.isSelected(component)) return '';
    
    const selectedIds = this.selectedIds();
    const index = selectedIds.indexOf(component.id);
    
    if (index === -1) return '';
    return `${index + 1}`;
  }
  
  /**
   * Obtient les statistiques de sélection pour l'UI
   */
  getSelectionStats() {
    return {
      count: this.selectionCount(),
      hasMultiple: this.hasMultipleSelection(),
      mode: this.currentSelectionMode(),
      info: this.selectionInfo()
    };
  }
}
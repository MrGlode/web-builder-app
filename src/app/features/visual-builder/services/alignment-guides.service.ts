// src/app/features/visual-builder/services/alignment-guides.service.ts

import { Injectable, signal, computed } from '@angular/core';

/**
 * Types de guides d'alignement
 */
export type GuideType = 'vertical' | 'horizontal' | 'center-v' | 'center-h';

/**
 * Interface pour un guide d'alignement
 */
export interface AlignmentGuide {
  id: string;
  type: GuideType;
  position: number; // Position en pixels (x pour vertical, y pour horizontal)
  start: number;    // Position de début (y pour vertical, x pour horizontal)
  end: number;      // Position de fin (y pour vertical, x pour horizontal)
  componentIds: string[]; // IDs des composants alignés
}

/**
 * Rectangle d'un composant pour les calculs
 */
export interface ComponentRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Service gérant les guides d'alignement visuels
 */
@Injectable({
  providedIn: 'root'
})
export class AlignmentGuidesService {
  
  // ===== CONFIGURATION =====
  
  /** Distance maximale pour activer un guide (en pixels) */
  private readonly SNAP_THRESHOLD = 8;
  
  /** Marge autour des guides (en pixels) */
  private readonly GUIDE_MARGIN = 20;
  
  // ===== STATE =====
  
  /** Guides actifs actuellement affichés */
  private activeGuides = signal<AlignmentGuide[]>([]);
  
  /** Indique si les guides sont activés */
  private guidesEnabled = signal<boolean>(true);
  
  /** Rectangle du composant en cours de déplacement */
  private movingRect = signal<ComponentRect | null>(null);
  
  // ===== COMPUTED =====
  
  /** Guides verticaux actifs */
  verticalGuides = computed(() => 
    this.activeGuides().filter(g => g.type === 'vertical' || g.type === 'center-v')
  );
  
  /** Guides horizontaux actifs */
  horizontalGuides = computed(() => 
    this.activeGuides().filter(g => g.type === 'horizontal' || g.type === 'center-h')
  );
  
  /** Indique si des guides sont actifs */
  hasActiveGuides = computed(() => this.activeGuides().length > 0);
  
  /** Vérifie si les guides sont activés */
  isEnabled = computed(() => this.guidesEnabled());
  
  // ===== PUBLIC METHODS =====
  
  /**
   * Active ou désactive les guides
   */
  setEnabled(enabled: boolean): void {
    this.guidesEnabled.set(enabled);
    if (!enabled) {
      this.clear();
    }
  }
  
  /**
   * Calcule et affiche les guides d'alignement
   */
  updateGuides(movingComponent: ComponentRect, staticComponents: ComponentRect[]): void {
    if (!this.guidesEnabled()) {
      return;
    }
    
    this.movingRect.set(movingComponent);
    const guides: AlignmentGuide[] = [];
    
    // Pour chaque composant statique
    staticComponents.forEach(staticComp => {
      // Ignore le composant en mouvement
      if (staticComp.id === movingComponent.id) {
        return;
      }
      
      // Calcule les alignements possibles
      this.checkVerticalAlignment(movingComponent, staticComp, guides);
      this.checkHorizontalAlignment(movingComponent, staticComp, guides);
      this.checkCenterAlignment(movingComponent, staticComp, guides);
    });
    
    // Filtre les guides en doublon et garde les plus pertinents
    const uniqueGuides = this.filterUniqueGuides(guides);
    this.activeGuides.set(uniqueGuides);
  }
  
  /**
   * Applique le snap aux guides actifs
   * @returns Position ajustée si snap, sinon position originale
   */
  applySnap(x: number, y: number): { x: number; y: number; snapped: boolean } {
    if (!this.guidesEnabled() || this.activeGuides().length === 0) {
      return { x, y, snapped: false };
    }
    
    let snappedX = x;
    let snappedY = y;
    let hasSnapped = false;
    
    const movingRect = this.movingRect();
    if (!movingRect) {
      return { x, y, snapped: false };
    }
    
    // Vérifie les guides verticaux
    this.verticalGuides().forEach(guide => {
      const distToLeft = Math.abs(x - guide.position);
      const distToCenter = Math.abs((x + movingRect.width / 2) - guide.position);
      const distToRight = Math.abs((x + movingRect.width) - guide.position);
      
      if (distToLeft < this.SNAP_THRESHOLD) {
        snappedX = guide.position;
        hasSnapped = true;
      } else if (distToCenter < this.SNAP_THRESHOLD) {
        snappedX = guide.position - movingRect.width / 2;
        hasSnapped = true;
      } else if (distToRight < this.SNAP_THRESHOLD) {
        snappedX = guide.position - movingRect.width;
        hasSnapped = true;
      }
    });
    
    // Vérifie les guides horizontaux
    this.horizontalGuides().forEach(guide => {
      const distToTop = Math.abs(y - guide.position);
      const distToCenter = Math.abs((y + movingRect.height / 2) - guide.position);
      const distToBottom = Math.abs((y + movingRect.height) - guide.position);
      
      if (distToTop < this.SNAP_THRESHOLD) {
        snappedY = guide.position;
        hasSnapped = true;
      } else if (distToCenter < this.SNAP_THRESHOLD) {
        snappedY = guide.position - movingRect.height / 2;
        hasSnapped = true;
      } else if (distToBottom < this.SNAP_THRESHOLD) {
        snappedY = guide.position - movingRect.height;
        hasSnapped = true;
      }
    });
    
    return { x: snappedX, y: snappedY, snapped: hasSnapped };
  }
  
  /**
   * Efface tous les guides
   */
  clear(): void {
    this.activeGuides.set([]);
    this.movingRect.set(null);
  }
  
  // ===== PRIVATE METHODS =====
  
  /**
   * Vérifie les alignements verticaux (gauche, droite)
   */
  private checkVerticalAlignment(
    moving: ComponentRect, 
    static_: ComponentRect, 
    guides: AlignmentGuide[]
  ): void {
    // Alignement gauche
    if (Math.abs(moving.x - static_.x) < this.SNAP_THRESHOLD) {
      guides.push({
        id: `v-left-${static_.id}`,
        type: 'vertical',
        position: static_.x,
        start: Math.min(moving.y, static_.y) - this.GUIDE_MARGIN,
        end: Math.max(moving.y + moving.height, static_.y + static_.height) + this.GUIDE_MARGIN,
        componentIds: [moving.id, static_.id]
      });
    }
    
    // Alignement droite
    const movingRight = moving.x + moving.width;
    const staticRight = static_.x + static_.width;
    if (Math.abs(movingRight - staticRight) < this.SNAP_THRESHOLD) {
      guides.push({
        id: `v-right-${static_.id}`,
        type: 'vertical',
        position: staticRight,
        start: Math.min(moving.y, static_.y) - this.GUIDE_MARGIN,
        end: Math.max(moving.y + moving.height, static_.y + static_.height) + this.GUIDE_MARGIN,
        componentIds: [moving.id, static_.id]
      });
    }
  }
  
  /**
   * Vérifie les alignements horizontaux (haut, bas)
   */
  private checkHorizontalAlignment(
    moving: ComponentRect, 
    static_: ComponentRect, 
    guides: AlignmentGuide[]
  ): void {
    // Alignement haut
    if (Math.abs(moving.y - static_.y) < this.SNAP_THRESHOLD) {
      guides.push({
        id: `h-top-${static_.id}`,
        type: 'horizontal',
        position: static_.y,
        start: Math.min(moving.x, static_.x) - this.GUIDE_MARGIN,
        end: Math.max(moving.x + moving.width, static_.x + static_.width) + this.GUIDE_MARGIN,
        componentIds: [moving.id, static_.id]
      });
    }
    
    // Alignement bas
    const movingBottom = moving.y + moving.height;
    const staticBottom = static_.y + static_.height;
    if (Math.abs(movingBottom - staticBottom) < this.SNAP_THRESHOLD) {
      guides.push({
        id: `h-bottom-${static_.id}`,
        type: 'horizontal',
        position: staticBottom,
        start: Math.min(moving.x, static_.x) - this.GUIDE_MARGIN,
        end: Math.max(moving.x + moving.width, static_.x + static_.width) + this.GUIDE_MARGIN,
        componentIds: [moving.id, static_.id]
      });
    }
  }
  
  /**
   * Vérifie les alignements centrés
   */
  private checkCenterAlignment(
    moving: ComponentRect, 
    static_: ComponentRect, 
    guides: AlignmentGuide[]
  ): void {
    // Centre vertical
    const movingCenterX = moving.x + moving.width / 2;
    const staticCenterX = static_.x + static_.width / 2;
    if (Math.abs(movingCenterX - staticCenterX) < this.SNAP_THRESHOLD) {
      guides.push({
        id: `center-v-${static_.id}`,
        type: 'center-v',
        position: staticCenterX,
        start: Math.min(moving.y, static_.y) - this.GUIDE_MARGIN,
        end: Math.max(moving.y + moving.height, static_.y + static_.height) + this.GUIDE_MARGIN,
        componentIds: [moving.id, static_.id]
      });
    }
    
    // Centre horizontal
    const movingCenterY = moving.y + moving.height / 2;
    const staticCenterY = static_.y + static_.height / 2;
    if (Math.abs(movingCenterY - staticCenterY) < this.SNAP_THRESHOLD) {
      guides.push({
        id: `center-h-${static_.id}`,
        type: 'center-h',
        position: staticCenterY,
        start: Math.min(moving.x, static_.x) - this.GUIDE_MARGIN,
        end: Math.max(moving.x + moving.width, static_.x + static_.width) + this.GUIDE_MARGIN,
        componentIds: [moving.id, static_.id]
      });
    }
  }
  
  /**
   * Filtre les guides en doublon
   */
  private filterUniqueGuides(guides: AlignmentGuide[]): AlignmentGuide[] {
    const uniqueMap = new Map<string, AlignmentGuide>();
    
    guides.forEach(guide => {
      const key = `${guide.type}-${guide.position}`;
      const existing = uniqueMap.get(key);
      
      if (!existing) {
        uniqueMap.set(key, guide);
      } else {
        // Fusionne les componentIds
        const mergedIds = [...new Set([...existing.componentIds, ...guide.componentIds])];
        uniqueMap.set(key, {
          ...existing,
          start: Math.min(existing.start, guide.start),
          end: Math.max(existing.end, guide.end),
          componentIds: mergedIds
        });
      }
    });
    
    return Array.from(uniqueMap.values());
  }
}
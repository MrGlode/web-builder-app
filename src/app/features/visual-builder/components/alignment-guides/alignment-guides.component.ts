// src/app/features/visual-builder/components/alignment-guides/alignment-guides.component.ts

import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlignmentGuidesService, AlignmentGuide } from '../../services/alignment-guides.service';

@Component({
  selector: 'app-alignment-guides',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg 
      class="alignment-guides"
      [class.hidden]="!isVisible()"
    >
      <!-- Guides verticaux -->
      @for (guide of verticalGuides(); track guide.id) {
        <line
          [attr.x1]="guide.position"
          [attr.y1]="guide.start"
          [attr.x2]="guide.position"
          [attr.y2]="guide.end"
          [class.center-guide]="guide.type === 'center-v'"
          class="guide vertical"
        />
      }
      
      <!-- Guides horizontaux -->
      @for (guide of horizontalGuides(); track guide.id) {
        <line
          [attr.x1]="guide.start"
          [attr.y1]="guide.position"
          [attr.x2]="guide.end"
          [attr.y2]="guide.position"
          [class.center-guide]="guide.type === 'center-h'"
          class="guide horizontal"
        />
      }
    </svg>
  `,
  styles: [`
    .alignment-guides {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      
      &.hidden {
        display: none;
      }
    }
    
    .guide {
      stroke-width: 1;
      stroke: #ff00ff;
      stroke-dasharray: 4, 4;
      opacity: 0.8;
      
      &.center-guide {
        stroke: #00ffff;
        stroke-width: 1.5;
        stroke-dasharray: 2, 2;
      }
    }
  `]
})
export class AlignmentGuidesComponent {
  
  private guidesService = inject(AlignmentGuidesService);
  
  // ===== COMPUTED =====
  
  /** Guides verticaux */
  verticalGuides = this.guidesService.verticalGuides;
  
  /** Guides horizontaux */
  horizontalGuides = this.guidesService.horizontalGuides;
  
  /** Indique si des guides sont visibles */
  isVisible = computed(() => 
    this.guidesService.hasActiveGuides() && this.guidesService.isEnabled()
  );
}
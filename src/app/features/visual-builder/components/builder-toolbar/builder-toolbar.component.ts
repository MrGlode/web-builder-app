// src/app/features/visual-builder/components/builder-toolbar/builder-toolbar.component.ts

import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisualBuilderService } from '../../services/visual-builder.service';
import { HistoryService } from '../../services/history.service';
import { ViewMode } from '../../models/page.model';

@Component({
  selector: 'app-builder-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './builder-toolbar.component.html',
  styleUrls: ['./builder-toolbar.component.scss']
})
export class BuilderToolbarComponent {
  private builderService = inject(VisualBuilderService);
  private historyService = inject(HistoryService);

  // Outputs pour communiquer avec le parent
  onSave = output<void>();
  onPreview = output<void>();
  onExport = output<void>();
  onSettings = output<void>();
  viewModeChange = output<ViewMode>();
  zoomLevelChange = output<number>();

  // État de la toolbar
  currentViewMode: ViewMode = 'desktop';
  currentZoomLevel: number = 100;
  showZoomDropdown = false;

  // Expose les signals
  canUndo = this.builderService.canUndo;
  canRedo = this.builderService.canRedo;
  
  // Stats pour affichage
  historyStats = this.historyService.getStats.bind(this.historyService);

  // Niveaux de zoom prédéfinis
  zoomLevels = [25, 50, 75, 100, 125, 150, 200];

  /**
   * Actions principales
   */
  save() {
    this.onSave.emit();
  }

  undo() {
    if (this.canUndo()) {
      this.builderService.undo();
    }
  }

  redo() {
    if (this.canRedo()) {
      this.builderService.redo();
    }
  }

  preview() {
    this.onPreview.emit();
  }

  exportPage() {
    this.onExport.emit();
  }

  openSettings() {
    this.onSettings.emit();
  }

  /**
   * Changement de mode de vue
   */
  setViewMode(mode: ViewMode) {
    this.currentViewMode = mode;
    this.viewModeChange.emit(mode);
  }

  /**
   * Gestion du zoom
   */
  setZoomLevel(level: number) {
    this.currentZoomLevel = Math.max(25, Math.min(200, level));
    this.zoomLevelChange.emit(this.currentZoomLevel);
    this.showZoomDropdown = false;
  }

  zoomIn() {
    const newZoom = Math.min(200, this.currentZoomLevel + 10);
    this.setZoomLevel(newZoom);
  }

  zoomOut() {
    const newZoom = Math.max(25, this.currentZoomLevel - 10);
    this.setZoomLevel(newZoom);
  }

  resetZoom() {
    this.setZoomLevel(100);
  }

  toggleZoomDropdown() {
    this.showZoomDropdown = !this.showZoomDropdown;
  }

  /**
   * Vérifie si un mode de vue est actif
   */
  isViewModeActive(mode: ViewMode): boolean {
    return this.currentViewMode === mode;
  }

  /**
   * Obtient l'icône pour un mode de vue
   */
  getViewModeIcon(mode: ViewMode): string {
    const icons: Record<ViewMode, string> = {
      desktop: '🖥️',
      tablet: '📱',
      mobile: '📱'
    };
    return icons[mode];
  }

  /**
   * Obtient le label pour un mode de vue
   */
  getViewModeLabel(mode: ViewMode): string {
    const labels: Record<ViewMode, string> = {
      desktop: 'Desktop',
      tablet: 'Tablet',
      mobile: 'Mobile'
    };
    return labels[mode];
  }

  /**
   * Obtient les dimensions pour un mode de vue
   */
  getViewModeDimensions(mode: ViewMode): string {
    const dimensions: Record<ViewMode, string> = {
      desktop: '1280px+',
      tablet: '768px - 1024px',
      mobile: '< 768px'
    };
    return dimensions[mode];
  }
}
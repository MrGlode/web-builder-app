// src/app/features/api-orchestrator/components/designer-canvas/designer-canvas.component.ts

import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrchestratorGraphService } from '../../services/orchestrator-graph.service';
import { getBlockDefinition } from '../../models/block-definitions';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-designer-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './designer-canvas.component.html',
  styleUrls: ['./designer-canvas.component.scss']
})
export class DesignerCanvasComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<SVGSVGElement>;

  @Output() blockDropped = new EventEmitter<any>();
  @Output() blockMoved = new EventEmitter<any>();
  @Output() connectionCreated = new EventEmitter<any>();
  @Output() connectionRemoved = new EventEmitter<any>();
  @Output() blockSelected = new EventEmitter<string | null>();

  selectedBlockId: string | null = null;
  dragLine: { from: Point; to: Point } | null = null;
  dragStartPos: Point | null = null;
  draggedBlockId: string | null = null;

  constructor(private graphService: OrchestratorGraphService) {}

  get blocks() {
    return this.graphService.blocks;
  }

  get connections() {
    return this.graphService.connections;
  }

  ngAfterViewInit(): void {
    // Debug: voir les blocs
    console.log('Designer Canvas initialized');
    console.log('Current blocks:', this.blocks());
  }

  @HostListener('dragover', ['$event'])
  onHostDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('🔵 Dragover detected on MAIN');
    
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
      console.log('✅ dropEffect set to copy');
    }
  }

  @HostListener('drop', ['$event'])
  onHostDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🟢 DROP event detected on MAIN!');

    if (!event.dataTransfer) {
      console.error('❌ No dataTransfer');
      return;
    }

    const data = event.dataTransfer.getData('application/json');
    console.log('📦 Data received:', data);
    
    if (!data) {
      console.log('❌ Pas de données dans le drag');
      return;
    }

    try {
      const block = JSON.parse(data);
      console.log('✅ Block parsed:', block);
      
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      console.log('📍 Position:', { x, y });
      console.log('🎯 Block drop emission:', { definitionId: block.id, name: block.name });

      this.blockDropped.emit({
        definitionId: block.id,
        name: block.name,
        position: { x: Math.max(0, x), y: Math.max(0, y) }
      });
    } catch (error) {
      console.error('❌ Erreur lors du drop:', error);
    }
  }

  onBlockDragStart(event: DragEvent, blockId: string): void {
    this.draggedBlockId = blockId;
    this.dragStartPos = { x: event.clientX, y: event.clientY };
  }

  onBlockDragEnd(event: DragEvent): void {
    if (!this.draggedBlockId || !this.dragStartPos) return;

    const deltaX = event.clientX - this.dragStartPos.x;
    const deltaY = event.clientY - this.dragStartPos.y;

    const block = this.blocks().find(b => b.id === this.draggedBlockId);
    if (block) {
      this.blockMoved.emit({
        blockId: this.draggedBlockId,
        position: {
          x: block.position.x + deltaX,
          y: block.position.y + deltaY
        }
      });
    }

    this.draggedBlockId = null;
    this.dragStartPos = null;
  }

  onBlockSelected(event: MouseEvent, blockId: string): void {
    this.selectedBlockId = blockId;
    this.blockSelected.emit(blockId);
    event.stopPropagation();
  }

  onBlockDelete(event: MouseEvent, blockId: string): void {
    this.graphService.removeBlock(blockId);
    event.stopPropagation();
  }

  onPortDragStart(event: DragEvent, blockId: string, portId: string): void {
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'link';
      event.dataTransfer.setData('sourcePort', JSON.stringify({ blockId, portId }));
    }
  }

  onPortDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'link';
    }
  }

  onPortDrop(event: DragEvent, targetBlockId: string, targetPortId: string, type: 'input' | 'output'): void {
    event.stopPropagation();

    const sourceData = event.dataTransfer?.getData('sourcePort');
    if (!sourceData) return;

    try {
      const { blockId: sourceBlockId, portId: sourcePortId } = JSON.parse(sourceData);

      if (type === 'input') {
        this.connectionCreated.emit({
          sourceBlockId,
          sourcePortId,
          targetBlockId,
          targetPortId
        });
      }
    } catch (error) {
      console.error('Erreur lors du drop de port:', error);
    }
  }

  onConnectionClick(event: MouseEvent, connectionId: string): void {
    if (confirm('Supprimer cette connexion ?')) {
      this.connectionRemoved.emit({ connectionId });
    }
    event.stopPropagation();
  }

  getBlockColor(blockId: string): string {
    const block = this.blocks().find(b => b.id === blockId);
    if (!block) return '#999';

    const definition = getBlockDefinition(block.definitionId);
    return definition?.color || '#999';
  }

  getBlockIcon(type: string): string {
    const icons: Record<string, string> = {
      'api-call': '🌐',
      'condition': '🔀',
      'loop': '🔁',
      'transform': '🔄',
      'trigger': '▶️'
    };
    return icons[type] || '🔹';
  }

  getBlockInputPorts(blockId: string): any[] {
    const block = this.blocks().find(b => b.id === blockId);
    if (!block) return [];

    const definition = getBlockDefinition(block.definitionId);
    return definition?.inputs || [];
  }

  getBlockOutputPorts(blockId: string): any[] {
    const block = this.blocks().find(b => b.id === blockId);
    if (!block) return [];

    const definition = getBlockDefinition(block.definitionId);
    return definition?.outputs || [];
  }

  getPortPosition(blockId: string, portId: string): Point {
    // Position simulée - à améliorer avec getBoundingClientRect
    return { x: 0, y: 0 };
  }
}
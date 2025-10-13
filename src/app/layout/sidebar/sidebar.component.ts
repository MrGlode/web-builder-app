import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  // Input signal pour l'état collapsed
  collapsed = input<boolean>(false);

  // Menu items
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Design System',
      icon: 'palette',
      route: '/design-system'
    },
    {
      label: 'Visual Builder',
      icon: 'builder',
      route: '/visual-builder',
      badge: 3
    },
    {
      label: 'API Orchestrator',
      icon: 'flow',
      route: '/api-orchestrator'
    },
    {
      label: 'Templates',
      icon: 'template',
      route: '/templates'
    },
    {
      label: 'Deployment',
      icon: 'deploy',
      route: '/deployment'
    },
    {
      label: 'Compliance',
      icon: 'shield',
      route: '/compliance'
    }
  ];
}
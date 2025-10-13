import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DashboardCard {
  title: string;
  description: string;
  count: string;
  label: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  cards: DashboardCard[] = [
    {
      title: 'Projets actifs',
      description: 'Sites et applications en cours',
      count: '12',
      label: 'projets',
      color: '#3b82f6',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>'
    },
    {
      title: 'Composants',
      description: 'Bibliothèque de composants réutilisables',
      count: '48',
      label: 'composants',
      color: '#10b981',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>'
    },
    {
      title: 'API Flows',
      description: 'Orchestrations configurées',
      count: '24',
      label: 'flows',
      color: '#f59e0b',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6m0 4v10m-6-6h12M8 8h8"/><circle cx="12" cy="12" r="2"/></svg>'
    },
    {
      title: 'Déploiements',
      description: 'Mises en production ce mois-ci',
      count: '8',
      label: 'déploiements',
      color: '#8b5cf6',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'
    }
  ];
}
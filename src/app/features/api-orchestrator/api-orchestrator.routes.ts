// src/app/features/api-orchestrator/api-orchestrator.routes.ts

import { Routes } from '@angular/router';
import { ApiOrchestratorComponent } from './api-orchestrator.component';

export const API_ORCHESTRATOR_ROUTES: Routes = [
  {
    path: '',
    component: ApiOrchestratorComponent,
    title: 'API Orchestrator'
  },
  {
    path: 'new',
    component: ApiOrchestratorComponent,
    data: { mode: 'create' },
    title: 'Créer une orchestration'
  },
  {
    path: ':id',
    component: ApiOrchestratorComponent,
    data: { mode: 'edit' },
    title: 'Éditer orchestration'
  }
];
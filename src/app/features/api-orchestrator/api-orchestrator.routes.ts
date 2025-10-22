// src/app/features/api-orchestrator/api-orchestrator.routes.ts

import { Routes } from '@angular/router';
import { OrchestratorComponent } from './orchestrator.component';

export const API_ORCHESTRATOR_ROUTES: Routes = [
  {
    path: '',
    component: OrchestratorComponent,
    title: 'API Orchestrator'
  }
];
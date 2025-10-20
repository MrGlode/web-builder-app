import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent),
    title: 'Login - Web Builder Platform'
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        title: 'Dashboard - Web Builder Platform'
      },
      /**
      {
        path: 'design-system',
        loadChildren: () => import('./features/design-system/design-system.routes')
          .then(m => m.DESIGN_SYSTEM_ROUTES),
        title: 'Design System'
      },
      */
      {
        path: 'visual-builder',
        loadChildren: () => import('./features/visual-builder/visual-builder.routes')
          .then(m => m.VISUAL_BUILDER_ROUTES),
        title: 'Visual Builder'
      },
      {
        path: 'api-orchestrator',
        loadChildren: () => import('./features/api-orchestrator/api-orchestrator.routes')
          .then(m => m.API_ORCHESTRATOR_ROUTES),
        title: 'API Orchestrator'
      },
      /**
      {
        path: 'templates',
        loadChildren: () => import('./features/template-manager/template-manager.routes')
          .then(m => m.TEMPLATE_MANAGER_ROUTES),
        title: 'Templates Manager'
      },
      {
        path: 'deployment',
        loadChildren: () => import('./features/deployment/deployment.routes')
          .then(m => m.DEPLOYMENT_ROUTES),
        title: 'Deployment'
      },
      {
        path: 'compliance',
        loadChildren: () => import('./features/compliance/compliance.routes')
          .then(m => m.COMPLIANCE_ROUTES),
        title: 'Compliance & Security'
      }
        */
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
import { Routes } from '@angular/router';
import { VisualBuilderComponent } from './visual-builder.component';

/**
 * Routes du module Visual Builder
 */
export const VISUAL_BUILDER_ROUTES: Routes = [
  {
    path: '',
    component: VisualBuilderComponent,
    title: 'Visual Builder'
  },
  {
    path: 'page/:pageId',
    component: VisualBuilderComponent,
    title: 'Édition de page'
  }
];
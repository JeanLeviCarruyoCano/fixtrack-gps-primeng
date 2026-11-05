import { Routes } from '@angular/router';
import { usabilityModeGuard } from './src/app/usability/usability-mode.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./src/app/pages/Login/login').then((module) => module.Login),
  },
  {
    path: 'login',
    loadComponent: () => import('./src/app/pages/Login/login').then((module) => module.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./src/app/pages/Register/register').then((module) => module.Register),
  },
  {
    path: 'home',
    loadComponent: () => import('./src/app/pages/Home/home').then((module) => module.Home),
  },
  {
    path: 'usabilidad/resultados',
    canActivate: [usabilityModeGuard],
    loadComponent: () =>
      import('./src/app/usability/usability-results.component').then((m) => m.UsabilityResultsComponent),
  },

  {
    path: '**',
    redirectTo: '',
  },
];

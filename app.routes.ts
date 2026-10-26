import { Routes } from '@angular/router';

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
    path: '**',
    redirectTo: '',
  },
];

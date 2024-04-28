import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InitialTabPage } from './initial-tab.page';

const routes: Routes = [
  {
    path: '',
    component: InitialTabPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./../../home/home.module').then( m => m.HomePageModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('./../../page/admin/admin.module').then( m => m.AdminPageModule)
      },
      {
        path: 'team',
        loadChildren: () => import('./../../page/team/team.module').then( m => m.TeamPageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'initial-tab/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InitialTabPageRoutingModule {}

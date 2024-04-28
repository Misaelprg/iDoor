import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InitialTabPageRoutingModule } from './initial-tab-routing.module';

import { InitialTabPage } from './initial-tab.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InitialTabPageRoutingModule
  ],
  declarations: [InitialTabPage]
})
export class InitialTabPageModule {}

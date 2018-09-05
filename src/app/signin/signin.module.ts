import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SigninRoutingModule } from './signin-routing.module';
import { SigninComponent } from './signin.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SigninRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [SigninComponent]
})
export class SigninModule { }

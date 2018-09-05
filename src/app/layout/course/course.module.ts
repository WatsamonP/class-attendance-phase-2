import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CourseRoutingModule } from './course-routing.module';
import { CourseComponent } from './course.component';
import { EventComponent } from './event/event.component';
import { ScoreComponent } from './score/score.component';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
//
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
    imports: [
      CommonModule, CourseRoutingModule,
      FormsModule, ReactiveFormsModule,
      NgbModule.forRoot(),
      UiSwitchModule,
      JwBootstrapSwitchNg2Module,
      MatProgressBarModule
    ],
    declarations: [CourseComponent,EventComponent, ScoreComponent]
  })
  export class CourseModule {}
  
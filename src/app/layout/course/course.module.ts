import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CourseRoutingModule } from './course-routing.module';
import { CourseComponent } from './course.component';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
//
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EventComponent, ScoreComponent} from './table'
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
    imports: [
      CommonModule, CourseRoutingModule,
      FormsModule, ReactiveFormsModule,
      NgbModule.forRoot(),
      UiSwitchModule,
      JwBootstrapSwitchNg2Module,
      MatProgressBarModule,
      MatBadgeModule
    ],
    declarations: [CourseComponent,EventComponent, ScoreComponent]
  })
  export class CourseModule {}
  
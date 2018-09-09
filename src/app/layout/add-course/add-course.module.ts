import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddCourseRoutingModule } from './add-course-routing.module';
import { AddCourseComponent } from './add-course.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [CommonModule, AddCourseRoutingModule, FormsModule, ReactiveFormsModule,NgbModule.forRoot()],
    declarations: [AddCourseComponent]
})
export class AddCourseModule {}

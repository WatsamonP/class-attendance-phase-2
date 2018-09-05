import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddCourseRoutingModule } from './add-course-routing.module';
import { AddCourseComponent } from './add-course.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [CommonModule, AddCourseRoutingModule,ReactiveFormsModule],
    declarations: [AddCourseComponent]
})
export class AddCourseModule {}

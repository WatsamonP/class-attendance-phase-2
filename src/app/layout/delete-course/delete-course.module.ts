import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeleteCourseRoutingModule } from './delete-course-routing.module';
import { DeleteCourseComponent } from './delete-course.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [CommonModule, DeleteCourseRoutingModule,ReactiveFormsModule],
    declarations: [DeleteCourseComponent]
})
export class DeleteCourseModule {}

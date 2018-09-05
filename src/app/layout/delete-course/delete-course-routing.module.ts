import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeleteCourseComponent } from './delete-course.component';

const routes: Routes = [
    {
        path: '',
        component: DeleteCourseComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DeleteCourseRoutingModule {}

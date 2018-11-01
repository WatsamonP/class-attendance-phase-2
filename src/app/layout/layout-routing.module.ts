import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'prefix' },
      { path: 'dashboard', loadChildren: './dashboard/dashboard.module#DashboardModule' },
      { path: 'charts', loadChildren: './charts/charts.module#ChartsModule' },
      { path: 'tables', loadChildren: './tables/tables.module#TablesModule' },
      { path: 'forms', loadChildren: './form/form.module#FormModule' },
      { path: 'bs-element', loadChildren: './bs-element/bs-element.module#BsElementModule' },
      { path: 'grid', loadChildren: './grid/grid.module#GridModule' },
      { path: 'components', loadChildren: './bs-component/bs-component.module#BsComponentModule' },
      { path: 'blank-page', loadChildren: './blank-page/blank-page.module#BlankPageModule' },
      { path: 'add-course', loadChildren: './add-course/add-course.module#AddCourseModule' },
      { path: 'delete-course', loadChildren: './delete-course/delete-course.module#DeleteCourseModule' },
      { path: 'course/:id', loadChildren: './course/course.module#CourseModule' },
      { path: 'course/:id/:event', loadChildren: './course/course.module#CourseModule' },
      { path: 'course/:id/:event/:group', loadChildren: './course/course.module#CourseModule' },
      { path: 'feedback/:id', loadChildren: './feedback/feedback.module#FeedbackModule' },
      { path: 'feedback/:id/:index', loadChildren: './feedback/feedback.module#FeedbackModule' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }

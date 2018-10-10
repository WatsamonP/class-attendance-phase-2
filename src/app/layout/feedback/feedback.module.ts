import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbCarouselModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FeedbackRoutingModule } from './feedback-routing.module';
import { FeedbackComponent } from './feedback.component';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import {
  TimelineComponent,
  NotificationComponent,
  ChatComponent,
} from './components';
import { StatModule } from '../../shared';

@NgModule({
  imports: [
    CommonModule,
    FeedbackRoutingModule,
    NgbCarouselModule.forRoot(),
    NgbAlertModule.forRoot(),
    StatModule,
    Ng2Charts,
    NgbModule.forRoot()
  ],
  declarations: [
    FeedbackComponent,
    TimelineComponent,
    NotificationComponent,
    ChatComponent,
  ]
})
export class FeedbackModule { }

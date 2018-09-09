import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventRoutingModule } from './event-routing.module';
import { EventComponent } from './event.component';
import { UiSwitchModule } from 'ngx-toggle-switch';

@NgModule({
    imports: [CommonModule, EventRoutingModule,UiSwitchModule],
    declarations: [EventComponent]
})
export class EventModule {}

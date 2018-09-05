import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScoreRoutingModule } from './score-routing.module';
import { ScoreComponent } from './score.component';

@NgModule({
    imports: [CommonModule, ScoreRoutingModule],
    declarations: [ScoreComponent]
})
export class ScoreModule {}

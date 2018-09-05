import { Component, OnInit, TemplateRef, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database'
import { Observable, Subject } from 'rxjs';
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { Router, ParamMap, ActivatedRoute, } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbAlert, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/operators';
import { isNumber } from 'util';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from '../../../shared/services/messageService';
import { AuthService } from '../../../shared/services/auth.service'

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
  providers: [NgbAlertConfig],
})
export class ScoreComponent implements OnInit {
  
  constructor(
    private afDb: AngularFireDatabase,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private alertConfig: NgbAlertConfig,
    private _messageService: MessageService,
    private authService: AuthService,
  ) {}

  ngOnInit(){
    
  }
}


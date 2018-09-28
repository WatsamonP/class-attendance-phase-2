import { Component, OnInit, TemplateRef, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database'
import { Observable, Subject } from 'rxjs';
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { Router, ParamMap, ActivatedRoute, } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbAlert, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/operators';
import { isNumber } from 'util';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from '../../shared/services/messageService';
import { AuthService } from '../../shared/services/auth.service'

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  providers: [NgbAlertConfig],
})
export class FeedbackComponent implements OnInit {

  authUid: String;
  courseParam: String;
  courseItem: Observable<any>;
  feebackList: any;

  constructor(
    private afDb: AngularFireDatabase,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private alertConfig: NgbAlertConfig,
    private _messageService: MessageService,
    private authService: AuthService,
  ) {
    this.authUid = this.authService.currentUserId;

    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      let cId = params.get('id');
      this.courseParam = params.get('id');


      // Query Couese
      this.courseItem = afDb.object(`users/${this.authUid}/course/${cId}`).valueChanges();

      afDb.list(`users/${this.authUid}/course/${cId}/Feedback`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(fb => {
        this.feebackList = fb;
        console.log(this.feebackList)
        return fb.map(item => item.key);
      });

    });
  }

  ngOnInit() {

  }










  buttonOutlineStyle = [
    'btn-outline-primary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
    'btn-outline-primary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
    'btn-outline-primary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
    'btn-outline-primary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
    'btn-outline-primary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
    'btn-outline-primary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
  ];

  buttonStyle = [
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
  ];

  borderStyle = [
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
  ];

  classColor = [
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info',
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info',
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info',
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info',
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info',
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info'
  ]
}


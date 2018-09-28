import { Component, OnInit, TemplateRef, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database'
import { Observable, Subject } from 'rxjs';
import { Validators, FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { Router, ParamMap, ActivatedRoute, } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbAlert, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/operators';
import { isNumber } from 'util';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from '../../../../shared/services/messageService';
import { AuthService } from '../../../../shared/services/auth.service'

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
  providers: [NgbAlertConfig],
})
export class ScoreComponent implements OnInit {

  objectKeys = Object.keys;  
  authUid: String;
  courseParam: String;
  groupParam: String;
  courseItem: Observable<any>;

  groupList: any;
  courseList: any;
  studentList: any;
  scheduleList: any;
  isGroupFilter: boolean;
  studentGroupSelected: String;
  isNotShowData: boolean;
  scoreList: any;
  dynamicEvent: any;
  percentageConfig: any;
  selectedCourse: any;
  //
  configTotalPercent: Number;
  totalPercent: any;
  studentGrade: any;
  isShowStudentsName: boolean = false;

  constructor(
    private afDb: AngularFireDatabase,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private alertConfig: NgbAlertConfig,
    private _messageService: MessageService,
    private authService: AuthService,
    private modalService: NgbModal,
  ) {
    this.authUid = this.authService.currentUserId;
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      let cId = params.get('id');
      let event = params.get('event');
      this.courseParam = cId;
      //this.eventParam = event;
      this.groupParam = params.get('group');

      // Query Couese
      this.courseItem = afDb.object(`users/${this.authUid}/course/${cId}`).valueChanges();
      this.setInitCourseDataForm()

      this.groupList = [];
      this.selectedCourse = [];
      afDb.list(`users/${this.authUid}/course/`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(course => {
        this.courseList = course;
        for (var i = 0; i < this.courseList.length; i++) {
          if (this.courseList[i].id == this.courseParam) {
            this.groupList = Object.keys(this.courseList[i].group)
              .map(key => Object.assign({ key }, this.courseList[i].group[key]));
          }
        }
        return course.map(item => item.key);
      });

      // Query studentList, studentList
      this.studentList = [];
      this.scheduleList = [];
      this.scoreList = [];
      afDb.list(`users/${this.authUid}/course/${cId}/schedule`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
        this.scheduleList = items;
        if (this.scheduleList.length == 0) {
          this.isNotShowData = false;
        } else {
          afDb.list(`users/${this.authUid}/course/${cId}/students`).snapshotChanges().map(actions => {
            return actions.map(action => ({ key: action.key, ...action.payload.val() }));
          }).subscribe(stds => {
            this.isNotShowData = true;
            if (this.groupParam == 'all') {
              this.studentList = stds;      // query นศ
              this.calStudentPetcent();
              this.studentGroupSelected = 'All Group'
              this.isGroupFilter = false;
            } else {
              this.isGroupFilter = true;    // แสดงแค่บางกลุ่ม
              let temp: any = stds;
              for (var i = 0; i < stds.length; i++) {
                if (temp[i].group == this.groupParam) {
                  this.studentList.push(temp[i])
                }
              }
              this.calStudentPetcent();
              this.studentGroupSelected = this.groupList[Number(this.groupParam) - 1].name;
            }
            return stds.map(item => item.key);
          });
        }

        return items.map(item => item.key);
      });

    });// close param
  }

  ngOnInit() {

  }

  setInitCourseDataForm() {
    this.courseItem.subscribe(item => {
      let eventKey = Object.keys(item.eventList)
      // Percent ของแต่ละ Event
      this.dynamicEvent = [];
      for (var j = 0; j < eventKey.length; j++) {
        let temp = String(eventKey[j])
        if (temp == 'score') {
          continue;
        }
        let percentKey = String('percent' + item.eventList[temp].name);
        let nameKey = String(item.eventList[temp].name);
        this.dynamicEvent.push({ name: nameKey, percent: item[percentKey], percentKey: percentKey, id: temp })
      }
      this.calTotalPercent();
    })
  }

  calTotalPercent(){
    let total = 0
    for(var i=0; i<this.dynamicEvent.length; i++){
      total = total + this.dynamicEvent[i].percent;
    }
    this.configTotalPercent = total;
  }

  calStudentPetcent(){
    this.totalPercent = [];
    this.studentGrade = []
    let total = 0
    for(var i=0; i<this.studentList.length; i++){
      total = 0
      for(var j=0; j<this.dynamicEvent.length; j++){
        let temp = this.dynamicEvent[j].id
        if(this.studentList[i].score[temp] !== undefined){
          total = total + this.studentList[i].score[temp] 
        }
      }
      let grade = this.calGrade(total)
      this.totalPercent.push(total)
      this.studentGrade.push(grade)
    } 
  }

  calGrade(score){
    let grade: String = '';
    if(score >= 80){
      grade = 'A'
    }else if(score >= 75){
      grade = 'B+'
    }else if(score >= 70){
      grade = 'B'
    }else if(score >= 65){
      grade = 'C+'
    }else if(score >= 60){
      grade = 'C'
    }else if(score >= 55){
      grade = 'D+'
    }else if(score >= 50){
      grade = 'D'
    }else{
      grade = 'F'
    }

    return grade;
  }

  public configGrade(content) {
    //this.modalService.open(content, { centered: true });
  }

  public sendMessageToStudentsName(){
    this.isShowStudentsName = !this.isShowStudentsName;
  }

}


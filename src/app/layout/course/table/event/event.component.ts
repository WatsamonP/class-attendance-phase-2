import { Component, OnInit, TemplateRef, ViewChild, Input, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database'
import { Observable, Subject } from 'rxjs';
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { Router, ParamMap, ActivatedRoute, } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbAlert, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/operators';
import { isNumber } from 'util';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from '../../../../shared/services/messageService';
import { AuthService } from '../../../../shared/services/auth.service'
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
//import { format } from 'path';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  providers: [NgbAlertConfig],
})
export class EventComponent implements OnInit {
  @Input() name;
  @Input() public alerts: Array<string> = [];
  @ViewChild('duplicateEventScore')
  private duplicateEventScoreRef: TemplateRef<any>;
  @ViewChild('deleteStudent')
  private deleteStudentRef: TemplateRef<any>;

  objectKeys = Object.keys;     // เอาไว้ใช้ใน html
  eventParam: any;
  groupParam: any;
  studentObservable: Observable<any>;
  scheduleObservable: Observable<any>;
  studentList: any;
  scheduleList: any;
  schedulePagList: any;
  changeScore: any;
  changeScoreForm: FormGroup;
  tempSchedule: any;
  studentObjectKeys;
  closeTemplateResult: string
  closeResult: string;
  // 2 บรรทัดนี้ set Alert
  staticAlertClosed = true;
  updateScoreString: string;
  isFixScore: boolean;  // เปิดช่องแก้ไขคะแนน
  isShowGroup: boolean;  // แสดงกลุ่มเรียน
  isShowPercent: boolean;  // แสดง%
  isShowTotal: Number;  // แสดงคะแนนรวม
  isShowCountMiss: boolean;  // จำนวนครั้งขาดเรียน
  numberOfPage: number = 1;
  numberOfAllPage: number;
  numberOfAllPageShow: number;
  numberOfCol: number;
  isNotFound = true;
  isNotShowData = false;
  authUid: String;
  courseParam: String;
  countAttendance: any;
  temp: any;
  runFlag = false;
  inputScore: Number;
  selectedSchedule: any;
  courseList: any;
  myKey: any;
  chartData: any;
  isconfirmDuplicate: boolean = false;
  formDisabled: boolean;
  missedClassCount: any;
  percentageScore: any;
  percentageConfig: any;
  fixScoreIndex: any;
  dynamicEvent: any;
  eventName: String;
  studentGroupList: any;
  studentGroupSelected: String;
  studentGroupSelectedIndex = 0;
  countStudent: Number;
  groupList: any;
  groupCount: any;
  isGroupFilter: boolean = false;
  numberOfCountLate: Number = 2;
  missScoreRate = [
    { score: 2, class: 'yellow' },
    { score: 4, class: 'orange' },
    { score: 6, class: 'red' },
  ];
  studentDeleteMessage: String;

  constructor(
    private afDb: AngularFireDatabase,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private alertConfig: NgbAlertConfig,
    private _messageService: MessageService,
    private authService: AuthService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {
    //this.authUid = this.authService.authInfo$.value.$uid;
    this.authUid = this.authService.currentUserId;
    this._messageService.listen().subscribe((m: any) => {
      this.isShowGroup = m.isShowGroup;
      this.isShowPercent = m.isShowPercent;
      this.isShowCountMiss = m.isShowCountMiss;
    })
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      let cId = params.get('id');
      let event = params.get('event');
      this.courseParam = cId;
      this.eventParam = event;
      this.groupParam = params.get('group');
      this.scheduleObservable = afDb.object(`users/${this.authUid}/course/${cId}/schedule/${event}`).valueChanges();
      this.studentObservable = afDb.object(`users/${this.authUid}/course/${cId}/students`).valueChanges();

      // Query Course
      this.groupList = [];
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
      afDb.list(`users/${this.authUid}/course/${cId}/schedule/${event}`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
        this.scheduleList = items;
        if (this.scheduleList.length == 0) {
          console.log('ไม่มี Schedule')
          this.isNotShowData = false;
          setTimeout(() => this.isNotFound = false);
          setTimeout(() => this.isNotFound = true, 6000);
          this.alertConfig.type = 'warning';
          return false
        } else {
          this.isNotShowData = true;
          this.numberOfCol = 5;
          this.numberOfPage = Math.ceil(this.scheduleList.length / this.numberOfCol);
          this.numberOfAllPageShow = Math.ceil(this.scheduleList.length / this.numberOfCol);
          this.numberOfAllPage = this.numberOfAllPageShow * 10;
          afDb.list(`users/${this.authUid}/course/${cId}/students`).snapshotChanges().map(actions => {
            return actions.map(action => ({ key: action.key, ...action.payload.val() }));
          }).subscribe(stds => {
            this.studentList = [];
            this.findPercentage();  //CONFIG Percent  ไว้แสดงเฉยๆ

            // ATTENDANCE
            if (this.eventParam == 'attendance') {
              if (this.groupParam == 'all') { // แสดงทุกกลุ่ม
                this.studentList = stds;      // query นศ
                this.findMissClassCount()     // นับจำนวนมานาย
                this.findStudentAttendancePercent();  // แสดง %
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
                this.findMissClassCount();
                this.findStudentAttendancePercent();
                this.studentGroupSelected = this.groupList[Number(this.groupParam) - 1].name;
                //  นับไว้แสดง ล่างสุดของตาราง
                this.findGroupCountAttendance(this.groupParam)
              }
              // ! ATTENDANCE
            } else {
              this.changeScore = []
              if (this.groupParam == 'all') {
                this.studentList = stds;
                this.findEventPercent();
                this.findZeroScore(this.eventParam)
                for (var i = 0; i < this.studentList.length; i++) {
                  this.changeScore.push('')
                }
                this.studentGroupSelected = 'All Group'
                this.isGroupFilter = false;
              } else {
                this.isGroupFilter = true;
                let temp: any = stds;
                for (var i = 0; i < stds.length; i++) {
                  if (temp[i].group == this.groupParam) {
                    this.studentList.push(temp[i])
                    this.changeScore.push('')
                  }
                }
                this.findEventPercent();
                this.findZeroScore(this.eventParam)
                this.studentGroupSelected = this.groupList[Number(this.groupParam) - 1].name;
                this.findGroupCount(this.groupParam)
              }
            }
            return stds.map(item => item.key);
          });
        }
        return items.map(item => item.key);
      });

    });// close param

  }

  onClickFixScore(i) {
    this.fixScoreIndex = i;
    this.isFixScore = !this.isFixScore;
  }

  setIndexForFix(i) {
    this.fixScoreIndex = i;
  }

  isEmptyObject(obj) {
    return (obj == undefined || obj == null);
  }

  queryCourse(course_id) {
    this.chartData = [];
    let barCourse = [];
    let labels = [];
    let dataSet = [];
    let dataTemp = [];
    for (var i = 0; i < this.courseList.length; i++) {
      if ((!this.isEmptyObject(this.courseList[i].schedule)) && (course_id == this.courseList[i].key)) {
        this.myKey = Object.keys(this.courseList[i].schedule.attendance);
        barCourse = [];
        labels = [];
        dataSet = [];
        //
        let onTime = [], late = [], miss = [], leave = [];
        for (var k = 0; k < this.myKey.length; k++) {
          //ได้ Object มา
          barCourse.push(this.courseList[i].schedule.attendance[this.myKey[k]])
          // เอาเฉพาะวันที่มาเป็น Labels
          //let date = this.courseList[i].schedule.attendance[this.myKey[k]].date;
          //let dateShow = moment(date).format("DD-MM-YYYY");
          //labels.push(dateShow)
          onTime.push(this.courseList[i].schedule.attendance[this.myKey[k]].countOnTime)
          late.push(this.courseList[i].schedule.attendance[this.myKey[k]].countLate)
          miss.push(this.courseList[i].schedule.attendance[this.myKey[k]].countMiss)
          leave.push(this.courseList[i].schedule.attendance[this.myKey[k]].countLeave)
        }
        dataSet.push(
          { data: onTime, label: 'on Time' },
          { data: miss, label: 'Missed Class' },
          { data: late, label: 'Late' },
          { data: leave, label: 'Leave' }
        )
        this.chartData.push(barCourse)
        //this.chartLabels.push(labels);
        //this.chartData.push(dataSet);
      }
    }
  }

  ngOnInit() {
    this.changeScoreForm = this.fb.group({
      changeScore: [null, Validators.required],
    });
  }

  // เมื่อกด ENTER
  onChangeScore(student, dateId, index, studentIndex) {
    //let score = Number(this.changeScoreForm.value.changeScore);
    let score = Number(this.changeScore[studentIndex]);
    this.changeScoreForm.patchValue({ changeScore: null })

    if (this.eventParam == 'attendance') {
      console.log('ไม่อนุญาติให้ป้อนคะแนน สำหรับ Attendance');
      this.toastr.error('ไม่อนุญาติให้ป้อนคะแนน สำหรับ Attendance');
      return false;
    }

    if (isNaN(score)) {
      this.toastr.error('ข้อมูลจะไม่ถูกบันทึกลงฐานข้อมูล', 'กรุณาป้อนตัวเลข');
    } else if (isNumber(score)) {
      let total = this.scheduleList[this.fixScoreIndex].totalScore;
      if (score > total) {
        this.toastr.error(score + ' ต้องน้อยกว่าหรือเท่ากับ ' + total, 'ผิดพลาด ป้อนคะแนนเกิน');
      } else {
        this.findCount(dateId, student, score, index)
      }
    }

  }

  // XXXXXXX  XXXXXXXX  XXXXXXXX    XXXXXXX  XX    XX
  // XX   XX     XX        XX       XX       XXX   XX 
  // XXXXXXX     XX        XX       XXXXXXX  XX X  XX
  // XX   XX     XX        XX       XX       XX  X XX 
  // XX   XX     XX        XX       XX       XX   XXX

  findMissClassCount() {
    let count = 0;
    let countLate = 0;
    console.log(this.studentList.length)
    this.missedClassCount = []; // เก็บ Array เท่าจำนวน นศ
    for (var i = 0; i < this.studentList.length; i++) {
      count = 0;
      countLate = 0;
      for (var j = 0; j < this.scheduleList.length; j++) {
        let attKey = this.scheduleList[j].key; // เป็น Attendance อยู่แล้ว 
        if (this.studentList[i].attendance[attKey].status == "Missed Class") {
          count++;
        }
        else if (this.studentList[i].attendance[attKey].status == "Late") {
          countLate++;
          //console.log(countLate)
          if (countLate % Number(this.numberOfCountLate) == 0) {
            count++;
          }
        }
      }
      this.missedClassCount.push(count)

    }
    console.log(this.missedClassCount)
  }

  findStudentAttendancePercent() {
    this.dynamicEvent = 'percentAttendance'
    let sumScore = 0; // ผลบวกคะแนนของ Student
    //let totalScore = 1; // คะแนนเต็มที่อาจารย์กำหนด Attendance ไม่ต้องกำหนด
    let percenConfig = this.percentageConfig.percentAttendance;
    let percentage = 0; // เก็บค่าเฉยๆ

    this.percentageScore = []; // เก็บ Array เท่าจำนวน นศ
    for (var i = 0; i < this.studentList.length; i++) {
      sumScore = 0;
      for (var j = 0; j < this.scheduleList.length; j++) {
        let attKey = this.scheduleList[j].key; // เป็น Attendance อยู่แล้ว 
        sumScore = Number(sumScore) + Number(this.studentList[i].attendance[attKey].score)
      }
      this.isShowTotal = this.scheduleList.length;
      percentage = (sumScore * percenConfig / this.scheduleList.length)
      this.percentageScore.push(percentage)
    }

    this.setPercentToDB()
  }

  setPercentToDB() {
    for (var i = 0; i < this.studentList.length; i++) {
      this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/students/${this.studentList[i].id}/score`)
        .update({ attendance: this.percentageScore[i] });
    }
  }









  // =====================================================================================
  //
  //  XX  XXXXXXX  XXXXXXXX  XXXXXXXX    XXXXXXX  XX    XX
  //  XX  XX   XX     XX        XX       XX       XXX   XX 
  //  XX  XXXXXXX     XX        XX       XXXXXXX  XX X  XX
  //      XX   XX     XX        XX       XX       XX  X XX 
  //  XX  XX   XX     XX        XX       XX       XX   XXX

  // กำหนดค่า count เดิมทีบันทึกไว้
  findCount(dateId, student, score, index) {
    let count: any;
    for (var i = 0; i < this.scheduleList.length; i++) {
      if (this.scheduleList[i].id == dateId) {
        count = this.scheduleList[i].count;
        this.isCheckedOtherEvent(dateId, student, score, count, index)
        break;
      }
    }
  }

  // ตรวจสอบว่าเคยบันทึกคะแนนรึยัง ยกเว้น Attendance
  isCheckedOtherEvent(dateId, student, score, count, i) {
    //for (var i = 0; i < this.scheduleList.length; i++) {
    if (this.scheduleList[i].checked !== undefined) {
      if (student.id in this.scheduleList[i].checked) {
        // มีคะแนนแล้ว ลดค่า count 1 ค่า
        console.log('duplicate ต้องการบันทึกซ้ำ ??');
        this.openConfirmAlert(this.duplicateEventScoreRef, dateId, student, score, (count - 1));
        this.formDisabled = true;
        this.cdr.detectChanges();
        //break;
      } else {
        // ยังไม่เคยถูกบันทึก ให้บันทึกใหม่
        console.log('คะแนนยังไม่เคยถูกบันทึก')
        this.toastr.success(
          ' ของ ' + student.id + ' : ' + student.name + 'เป็น ' + score + ' คะแนน'
          , 'บันทึกคะแนน ' + this.eventParam
        );
        this.saveDataOtherEvent(dateId, student, score, count);
        console.log(dateId, student, score, count)
        //break;
      }
    } else {
      // บันทึกรอบแแรก ตอนที่ยังไม่มี checked เลย
      console.log('บันทึกจ้า ครั้งที่ 1')
      this.toastr.success(
        ' ของ ' + student.id + ' : ' + student.name + 'เป็น ' + score + ' คะแนน'
        , 'บันทึกคะแนน ' + this.eventParam
      );
      this.saveDataOtherEvent(dateId, student, score, count);
      console.log(dateId, student, score, count)
      //break;
    }
    //}
  }

  //บันทึกลง DB
  saveDataOtherEvent(dateId, student, score, count) {
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/students/${student.id}/${this.eventParam}/${dateId}`).update({
      score: score,
      date: Date(),
    })
    // ปรับค่า Count
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/schedule/${this.eventParam}/${dateId}`)
      .update({
        count: Number(count + 1)
      });
    // mark ไว้ว่า Check แล้ว
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/schedule/${this.eventParam}/${dateId}/checked/${student.id}`)
      .set({
        id: student.id,
      });
  }


  findZeroScore(event) {
    let count = 0;
    this.missedClassCount = []; // เก็บ Array เท่าจำนวน นศ
    for (var i = 0; i < this.studentList.length; i++) {
      count = 0;
      for (var j = 0; j < this.scheduleList.length; j++) {
        let key = this.scheduleList[j].key; // เป็น Attendance อยู่แล้ว 
        if (this.studentList[i][event][key].score == 0) {
          count++;
        } else {
          //console.log('Not Miss Class')
        }
      }
      this.missedClassCount.push(count)
    }
  }


  //  XXXXXXX  XXXXXXX  XXXXXXX  XXXXXXX  XXXXXXX  XX    XX  XXXXXXXX
  //  XX   XX  XX       XX   XX  XX       XX       XXX   XX     XX
  //  XXXXXXX  XXXXXXX  XXXXXXX  XX       XXXXXXX  XX X  XX     XX 
  //  XX       XX       XX  XX   XX       XX       XX  X XX     XX
  //  XX       XXXXXXX  XX   XX  XXXXXXX  XXXXXXX  XX   XXX     XX

  findEventPercent() {
    //console.log(this.percentageConfig)
    //let tempPercent = Object.keys(this.percentageConfig)
    let percentKey;
    for (var i = 0; i < this.courseList.length; i++) {
      if (this.courseList[i].id == this.courseParam) {
        //console.log(this.courseList[i].eventList)
        let eventKey = Object.keys(this.courseList[i].eventList)
        //console.log(eventKey)
        for (var j = 0; j < eventKey.length; j++) {
          let temp = String(eventKey[j])
          if (this.courseList[i].eventList[temp].id == this.eventParam) {
            //console.log(this.courseList[i].eventList[temp].name)
            percentKey = String('percent' + this.courseList[i].eventList[temp].name);
            this.dynamicEvent = percentKey;
            let percenConfig = this.percentageConfig[percentKey];
            //console.log(percenConfig)
            this.calPercentage(percenConfig, this.courseList[i].eventList[temp].id)
            this.findZeroScore(this.courseList[i].eventList[temp].id)
          }
        }
      }
    }
  }

  calPercentage(percenConfig, event) {
    let sumScore = 0; // ผลบวกคะแนนของ Student
    let totalScore = 0; // คะแนนเต็มที่อาจารย์กำหนด Attendance ไม่ต้องกำหนด
    let percentage = 0; // เก็บค่าเฉยๆ
    this.percentageScore = []; // เก็บ Array เท่าจำนวน นศ
    for (var i = 0; i < this.studentList.length; i++) {
      sumScore = 0;
      totalScore = 0;
      for (var j = 0; j < this.scheduleList.length; j++) {
        let key = this.scheduleList[j].key; // xxxx-xx-xx-xx-xx-xx
        totalScore = Number(totalScore) + Number(this.scheduleList[j].totalScore);
        // console.log(this.studentList[i][id][key].score) ได้คะแนนออกมา
        sumScore = Number(sumScore) + Number(this.studentList[i][event][key].score)
      }
      this.isShowTotal = totalScore;
      //console.log(totalScore);
      percentage = (sumScore * percenConfig / totalScore)
      this.percentageScore.push(percentage)

    }
    this.setPercentOtherToDB(event)
  }

  setPercentOtherToDB(event) {
    for (var i = 0; i < this.studentList.length; i++) {
      this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/students/${this.studentList[i].id}/score`)
        .update({ [event]: this.percentageScore[i] });
    }
  }

  /*
    ========================================================================================
    ========================================================================================
  */

  //  XXXXXXX  XXX      XX
  //  XX   XX  XX       XX  
  //  XXXXXXX  XX       XX  
  //  XX   XX  XX       XX   
  //  XX   XX  XXXXXXX  XXXXXXX
  findPercentage() {
    this.percentageConfig = {};
    let myKey;
    let obj = {}
    for (var i = 0; i < this.courseList.length; i++) {
      if (this.courseList[i].id == this.courseParam) {
        let eventKey = Object.keys(this.courseList[i].eventList)
        for (var j = 0; j < eventKey.length; j++) {
          let temp = String(eventKey[j])
          myKey = String('percent' + this.courseList[i].eventList[temp].name);
          obj = { [myKey]: this.courseList[i][myKey] };
          this.percentageConfig = Object.assign(this.percentageConfig, obj);
          // Set ไว้แสดงเฉยๆ
          if (this.courseList[i].eventList[temp].id == this.eventParam) {
            this.eventName = this.courseList[i].eventList[temp].name; // set ไว้แสดงเฉยๆ
          }
        }
      }
    }
  }

  findGroupCount(group) {
    this.groupCount = []
    let count = 0;
    for (var i = 0; i < this.scheduleList.length; i++) {
      count = 0;
      for (var j = 0; j < this.studentList.length; j++) {
        if (this.studentList[j].group == group) {
          if (this.studentList[j].id in this.scheduleList[i].checked) {
            count++;
          }
        }
      }
      this.groupCount.push(count);
    }
  }

  findGroupCountAttendance(group) {
    this.groupCount = []
    let schedule = Object.keys(this.scheduleList);
    for (var i = 0; i < schedule.length; i++) {
      let obj = {}
      let countLeave = 0; let countLate = 0; let countOnTime = 0; let countMiss = 0; let all = 0;
      for (var j = 0; j < this.studentList.length; j++) {
        if (this.studentList[j].group == group) {
          let temp = this.studentList[j].attendance[this.scheduleList[schedule[i]].key].status
          all++;
          if (temp == 'Leave') {
            countLeave++;
          } else if (temp == 'Late') {
            countLate++;
          } else if (temp == 'onTime') {
            countOnTime++;
          } else if (temp == 'Missed Class') {
            countMiss++;
          }
        }
      }
      obj = { countLeave: countLeave, countLate: countLate, countOnTime: countOnTime, countMiss: countMiss, all: all }
      this.groupCount.push(obj);
    }
  }

  public onDeleteStudent(student) {
    this.openConfirmDeleteStudentAlert(this.deleteStudentRef, student);
  }

  openConfirmDeleteStudentAlert(content, student) {
    console.log(student)
    this.studentDeleteMessage = String(student.id + ' : ' + student.name);
    this.modalService.open(content).result.then((result) => {
      this.toastr.success(
        student.id + ' : ' + student.name, 'ลบ'
      );
      console.log('save')
      this.deleteStudent(student.id);
      
    }, (reason) => {
      console.log('ปิด / ยกเลิก')
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.formDisabled = !this.formDisabled;
    });
  }

  deleteStudent(student){
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/students/${student}`).remove()
  }

































  // XXXXXXX  XXXXXXX  XXXXXXX  XX    XX    XX       XX  XXXXXXX  XXXXX    XXXXXXX  XX
  // XX   XX  XX   XX  XX       XXX   XX    XXX     XXX  XX   XX  XX   XX  XX   XX  XX
  // XX   XX  XXXXXXX  XXXXXXX  XX X  XX    XX X   X XX  XX   XX  XX   XX  XXXXXXX  XX
  // XX   XX  XX       XX       XX  X XX    XX  X X  XX  XX   XX  XX   XX  XX   XX  XX
  // XXXXXXX  XX       XXXXXXX  XX   XXX    XX   X   XX  XXXXXXX  XXXXX    XX   XX  XXXXXXX

  // Confirm ตอนต้องการแก้ไขคะแนน ที่เคยถูกบันทึกแล้ว
  public openConfirmAlert(content, dateId, student, score, count) {
    this.modalService.open(content, { size: 'sm' }).result.then((result) => {
      this.toastr.success(
        ' ของ ' + student.id + ' : ' + student.name + 'เป็น ' + score + ' คะแนน'
        , 'แก้ไขคะแนน ' + this.eventParam
      );
      console.log('บันทึกใหม่')
      this.saveDataOtherEvent(dateId, student, score, count);
      console.log('save ค่า' + dateId, student, score, count)
      this.closeResult = `Closed with: ${result}`;
      this.formDisabled = !this.formDisabled;
    }, (reason) => {
      console.log('ปิด / ยกเลิก')
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.formDisabled = !this.formDisabled;
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  openSm(content, index) {
    if (this.fixScoreIndex !== index) {
      // reset
      this.fixScoreIndex = null;
      this.isFixScore = false;
    }
    this.modalService.open(content);
  }
  ///////////////////////////////////////////////////////////////////////////////////////












  checkStatus(dateId, student, score, onTime, miss, late, leave) {
    if (score >= 1) {
      console.log('score > 1')
      this.insertAttOnTime(dateId, student, score, onTime, miss, late, leave)
    } else if (score == 0.5) {
      console.log('score 0.5')
      this.insertAttLate(dateId, student, score, onTime, miss, late, leave)
    } else if (score == 0) {
      console.log('score = 0/ยังไม่เซฟลง DB นะ')
    } else {
      console.log('error /ยังไม่เซฟลง DB นะ')
    }
    //console.log(dateId, student, score, onTime, miss, late, leave)
  }

  isChecked(dateId, student, score, onTime, miss, late, leave) {
    for (var i = 0; i < this.scheduleList.length; i++) {
      if (this.scheduleList[i].id == dateId) {
        if (this.scheduleList[i].checked !== undefined) {
          if (student.id == this.scheduleList[i].checked) {
            console.log('duplicate');
            console.log('ต้องการบันทึกซ้ำ ??')
            break;
            //this.errorDuplicateData(id, barcodeDataText);
          } else {
            console.log('บันทึกจ้า')
            this.checkStatus(dateId, student, score, onTime, miss, late, leave);
            break;
          }
        } else {
          console.log('บันทึกจ้า')
          this.checkStatus(dateId, student, score, onTime, miss, late, leave);
          break;
        }
      }
    }
  }

  insertAttOnTime(dateId, student, score, onTime, miss, late, leave) {
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/students/${student.id}/attendance/${dateId}`).update({
      score: score,
      status: 'onTime',
      date: Date(),
    })
    // ปรับค่า Count
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/schedule/attendance/${dateId}`)
      .update({
        countLate: late,
        countMiss: miss - 1,
        countOnTime: onTime + 1,
        countLeave: leave,
      });
    // mark ไว้ว่า Check แล้ว
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/schedule/attendance/${dateId}/checked/${student.id}`)
      .set({
        id: student.id,
      });

  }

  insertAttLate(dateId, student, score, onTime, miss, late, leave) {
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/students/${student.id}/attendance/${dateId}`).update({
      score: score,
      status: 'Late',
      date: Date(),
    })
    // ปรับค่า Count
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/schedule/attendance/${dateId}`)
      .update({
        countLate: late + 1,
        countMiss: miss - 1,
        countOnTime: onTime,
        countLeave: leave,
      });
    // mark ไว้ว่า Check แล้ว
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/schedule/attendance/${dateId}/checked/${student.id}`)
      .set({
        id: student.id,
      });

  }



}


import { Component, OnInit, TemplateRef, ViewChild, Input, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
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
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';

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

  //private duplicateEventScore<any>;

  objectKeys = Object.keys;     // เอาไว้ใช้ใน html
  selectedEvent: any;
  studentObservable: Observable<any>;
  scheduleObservable: Observable<any>;
  studentList: any;
  scheduleList: any;
  schedulePagList: any;
  changeScore: String;
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
  isShowTotal: boolean;  // แสดงคะแนนรวม
  isShowCountMiss: boolean;  // จำนวนครั้งขาดเรียน
  numberOfPage: number = 1;
  numberOfAllPage: number;
  numberOfAllPageShow: number;
  numberOfCol: number;
  isNotFound = true;
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
    this.authUid = this.authService.authInfo$.value.$uid;
    this._messageService.listen().subscribe((m: any) => {
      this.isFixScore = m.isFixScore;
      this.isShowGroup = m.isShowGroup;
      this.isShowPercent = m.isShowPercent;
      this.isShowTotal = m.isShowTotal;
      this.isShowCountMiss = m.isShowCountMiss;
    })
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      //let event = parseInt(params.get('event'));
      let cId = params.get('id');
      this.courseParam = cId;
      let event = params.get('event');
      this.selectedEvent = event;
      this.scheduleObservable = afDb.object(`users/${this.authUid}/course/${cId}/schedule/${event}`).valueChanges();
      this.studentObservable = afDb.object(`users/${this.authUid}/course/${cId}/students`).valueChanges();

      // Query
      afDb.list(`users/${this.authUid}/course/`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(course => {
        this.courseList = course;
        //this.queryCourse(cId);
        //console.log(this.chartData);
        return course.map(item => item.key);
      });


      this.studentList = [];
      this.scheduleList = [];
      this.schedulePagList = [];



      
      afDb.list(`users/${this.authUid}/course/${cId}/schedule/${event}`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
        this.scheduleList = items;
        if (this.scheduleList.length == 0) {
          console.log('ไม่มี Schedule')
          setTimeout(() => this.isNotFound = false);
          setTimeout(() => this.isNotFound = true, 6000);
          this.alertConfig.type = 'warning';
          return false
        } else {
          this.numberOfCol = 5;
          this.numberOfPage = Math.ceil(this.scheduleList.length / this.numberOfCol);
          this.numberOfAllPageShow = Math.ceil(this.scheduleList.length / this.numberOfCol);
          this.numberOfAllPage = this.numberOfAllPageShow * 10;
          afDb.list(`users/${this.authUid}/course/${cId}/students`).snapshotChanges().map(actions => {
            return actions.map(action => ({ key: action.key, ...action.payload.val() }));
          }).subscribe(stds => {
            this.studentList = stds;
            this.findPercentage()
            if (this.selectedEvent == 'attendance') {
              this.findMissClassCount()
              this.findStudentAttendancePercent()
            } else if (this.selectedEvent == 'quiz') {
              this.findStudentQuizPercent();
            } else if (this.selectedEvent == 'hw') {
              this.findStudentHwPercent();
            } else if (this.selectedEvent == 'lab') {
              this.findStudentLabPercent();
            } else if (this.selectedEvent == 'assignment') {
              this.findStudentAssignPercent();
            } else if (this.selectedEvent == 'exercise') {
              this.findStudentExercisePercent();
            } else if (this.selectedEvent == 'project') {
              this.findStudentProjectPercent();
            }else{
              console.log('Error หาไม่เห็น')
            }
            return stds.map(item => item.key);
          });
        }
        return items.map(item => item.key);
      });

    });// close param

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
  onChangeScore(student, dateId, index) {
    let score = Number(this.changeScoreForm.value.changeScore);
    //this.getSchedule(dateId, student, score)
    this.changeScoreForm.patchValue({ changeScore: null })
    //console.log(this.chartData[0][index])
    let onTime = this.chartData[0][index].countOnTime;
    let miss = this.chartData[0][index].countMiss;
    let late = this.chartData[0][index].countLate;
    let leave = this.chartData[0][index].countLeave;
    let count = this.chartData[0][index].count;
    //console.log(this.chartData)
    //console.log(student, dateId)

    if (this.selectedEvent == 'attendance') {
      console.log('ไม่อนุญาติให้ป้อนคะแนน สำหรับ Attendance');
      this.toastr.error('ไม่อนุญาติให้ป้อนคะแนน สำหรับ Attendance');
      return false;
    }

    if (isNaN(score)) {
      // Alert
      //setTimeout(() => this.staticAlertClosed = false);
      //this.updateScoreString = 'กรุณาป้อนตัวเลข *ข้อมูลจะไม่ถูกบันทึกลงฐานข้อมูล';
      //this.alertConfig.type = 'warning';
      //setTimeout(() => this.staticAlertClosed = true, 5000);
      this.toastr.error('ข้อมูลจะไม่ถูกบันทึกลงฐานข้อมูล', 'กรุณาป้อนตัวเลข');
    } else if (isNumber(score)) {
      console.log(this.selectedEvent)

      // Alert เดิม
      //setTimeout(() => this.staticAlertClosed = false);
      //this.updateScoreString = 'แก้ไขคะแนน ' + this.selectedEvent + ' ของ ( '
      //  + student.id + ' : ' + student.name + ' ) เป็น ' + score + ' คะแนน';
      //this.alertConfig.type = 'success';
      //setTimeout(() => this.staticAlertClosed = true, 5000);
      this.findCount(dateId, student, score)

    }
  }

  // XXXXXXX  XXXXXXXX  XXXXXXXX    XXXXXXX  XX    XX
  // XX   XX     XX        XX       XX       XXX   XX 
  // XXXXXXX     XX        XX       XXXXXXX  XX X  XX
  // XX   XX     XX        XX       XX       XX  X XX 
  // XX   XX     XX        XX       XX       XX   XXX

  findMissClassCount() {
    let count = 0;
    this.missedClassCount = []; // เก็บ Array เท่าจำนวน นศ
    for (var i = 0; i < this.studentList.length; i++) {
      count = 0;
      for (var j = 0; j < this.scheduleList.length; j++) {
        let attKey = this.scheduleList[j].key; // เป็น Attendance อยู่แล้ว 
        if (this.studentList[i].attendance[attKey].status == "Missed Class") {
          count++;
        } else {
          console.log('Not Miss Class')
        }
      }
      this.missedClassCount.push(count)
    }
  }

  findStudentAttendancePercent() {
    console.log(this.percentageConfig)
    let sumScore = 0; // ผลบวกคะแนนของ Student
    //let totalScore = 1; // คะแนนเต็มที่อาจารย์กำหนด Attendance ไม่ต้องกำหนด
    let percenConfig = this.percentageConfig.percentAtt;
    let percentage = 0; // เก็บค่าเฉยๆ

    this.percentageScore = []; // เก็บ Array เท่าจำนวน นศ
    for (var i = 0; i < this.studentList.length; i++) {
      sumScore = 0;
      for (var j = 0; j < this.scheduleList.length; j++) {
        let attKey = this.scheduleList[j].key; // เป็น Attendance อยู่แล้ว 
        sumScore = sumScore + this.studentList[i].attendance[attKey].score
      }
      percentage = (sumScore * this.scheduleList.length / percenConfig)
      this.percentageScore.push(percentage)
    }
  }











  //  XX  XXXXXXX  XXXXXXXX  XXXXXXXX    XXXXXXX  XX    XX
  //  XX  XX   XX     XX        XX       XX       XXX   XX 
  //  XX  XXXXXXX     XX        XX       XXXXXXX  XX X  XX
  //      XX   XX     XX        XX       XX       XX  X XX 
  //  XX  XX   XX     XX        XX       XX       XX   XXX

  // กำหนดค่า count เดิมทีบันทึกไว้
  findCount(dateId, student, score) {
    let count: any;
    for (var i = 0; i < this.scheduleList.length; i++) {
      if (this.scheduleList[i].id == dateId) {
        count = this.scheduleList[i].count;
        this.isCheckedOtherEvent(dateId, student, score, count)
        break;
      }
    }
  }

  // ตรวจสอบว่าเคยบันทึกคะแนนรึยัง ยกเว้น Attendance
  isCheckedOtherEvent(dateId, student, score, count) {
    for (var i = 0; i < this.scheduleList.length; i++) {
      if (this.scheduleList[i].checked !== undefined) {
        if (student.id in this.scheduleList[i].checked) {
          // มีคะแนนแล้ว ลดค่า count 1 ค่า
          console.log('duplicate ต้องการบันทึกซ้ำ ??');
          this.openConfirmAlert(this.duplicateEventScoreRef, dateId, student, score, (count - 1));
          this.formDisabled = true;
          this.cdr.detectChanges();
          break;
        } else {
          // ยังไม่เคยถูกบันทึก ให้บันทึกใหม่
          console.log('คะแนนยังไม่เคยถูกบันทึก')
          this.toastr.success(
            ' ของ ' + student.id + ' : ' + student.name + 'เป็น ' + score + ' คะแนน'
            , 'บันทึกคะแนน ' + this.selectedEvent
          );
          this.saveDataOtherEvent(dateId, student, score, count);
          break;
        }
      } else {
        // บันทึกรอบแแรก ตอนที่ยังไม่มี checked เลย
        console.log('บันทึกจ้า ครั้งที่ 1')
        this.toastr.success(
          ' ของ ' + student.id + ' : ' + student.name + 'เป็น ' + score + ' คะแนน'
          , 'บันทึกคะแนน ' + this.selectedEvent
        );
        this.saveDataOtherEvent(dateId, student, score, count);
        break;
      }
    }
  }

  //บันทึกลง DB
  saveDataOtherEvent(dateId, student, score, count) {
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/students/${student.id}/${this.selectedEvent}/${dateId}`).update({
      score: score,
      date: Date(),
    })
    // ปรับค่า Count
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/schedule/${this.selectedEvent}/${dateId}`)
      .update({
        count: Number(count + 1)
      });
    // mark ไว้ว่า Check แล้ว
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/schedule/${this.selectedEvent}/${dateId}/checked/${student.id}`)
      .set({
        id: student.id,
      });
  }


  //  XXXXXXX  XXXXXXX  XXXXXXX  XXXXXXX  XXXXXXX  XX    XX  XXXXXXXX
  //  XX   XX  XX       XX   XX  XX       XX       XXX   XX     XX
  //  XXXXXXX  XXXXXXX  XXXXXXX  XX       XXXXXXX  XX X  XX     XX 
  //  XX       XX       XX  XX   XX       XX       XX  X XX     XX
  //  XX       XXXXXXX  XX   XX  XXXXXXX  XXXXXXX  XX   XXX     XX
  findStudentQuizPercent() {
    console.log(this.percentageConfig)
    let sumScore = 0; // ผลบวกคะแนนของ Student
    let totalScore = 0; // คะแนนเต็มที่อาจารย์กำหนด Attendance ไม่ต้องกำหนด
    let percenConfig = this.percentageConfig.percentQuiz;
    let percentage = 0; // เก็บค่าเฉยๆ
    this.percentageScore = []; // เก็บ Array เท่าจำนวน นศ
    for (var i = 0; i < this.studentList.length; i++) {
      sumScore = 0;
      totalScore = 0;
      for (var j = 0; j < this.scheduleList.length; j++) {
        let key = this.scheduleList[j].key; // เป็น Attendance อยู่แล้ว 
        totalScore = totalScore + this.scheduleList[j].totalScore;
        sumScore = sumScore + this.studentList[i].quiz[key].score
      }
      console.log(totalScore)
      percentage = (sumScore * percenConfig / totalScore)
      this.percentageScore.push(percentage)
    }
  }
  findStudentHwPercent() {
    console.log(this.percentageConfig)
    let sumScore = 0; // ผลบวกคะแนนของ Student
    let totalScore = 0; // คะแนนเต็มที่อาจารย์กำหนด Attendance ไม่ต้องกำหนด
    let percenConfig = this.percentageConfig.percentHw;
    let percentage = 0; // เก็บค่าเฉยๆ
    this.percentageScore = []; // เก็บ Array เท่าจำนวน นศ
    for (var i = 0; i < this.studentList.length; i++) {
      sumScore = 0;
      totalScore = 0;
      for (var j = 0; j < this.scheduleList.length; j++) {
        let key = this.scheduleList[j].key; // เป็น Attendance อยู่แล้ว 
        totalScore = totalScore + this.scheduleList[j].totalScore;
        sumScore = sumScore + this.studentList[i].hw[key].score
      }
      console.log(totalScore)
      percentage = (sumScore * percenConfig / totalScore)
      this.percentageScore.push(percentage)
    }
  }
  findStudentLabPercent() {
    console.log(this.percentageConfig)
    let sumScore = 0; // ผลบวกคะแนนของ Student
    let totalScore = 0; // คะแนนเต็มที่อาจารย์กำหนด Attendance ไม่ต้องกำหนด
    let percenConfig = this.percentageConfig.percentLab;
    let percentage = 0; // เก็บค่าเฉยๆ
    this.percentageScore = []; // เก็บ Array เท่าจำนวน นศ
    for (var i = 0; i < this.studentList.length; i++) {
      sumScore = 0;
      totalScore = 0;
      for (var j = 0; j < this.scheduleList.length; j++) {
        let key = this.scheduleList[j].key; // เป็น Attendance อยู่แล้ว 
        totalScore = totalScore + this.scheduleList[j].totalScore;
        sumScore = sumScore + this.studentList[i].lab[key].score
      }
      console.log(totalScore)
      percentage = (sumScore * percenConfig / totalScore)
      this.percentageScore.push(percentage)
    }
  }
  findStudentAssignPercent() {
    console.log(this.percentageConfig)
    let sumScore = 0; // ผลบวกคะแนนของ Student
    let totalScore = 0; // คะแนนเต็มที่อาจารย์กำหนด Attendance ไม่ต้องกำหนด
    let percenConfig = this.percentageConfig.percentAssign;
    let percentage = 0; // เก็บค่าเฉยๆ
    this.percentageScore = []; // เก็บ Array เท่าจำนวน นศ
    for (var i = 0; i < this.studentList.length; i++) {
      sumScore = 0;
      totalScore = 0;
      for (var j = 0; j < this.scheduleList.length; j++) {
        let key = this.scheduleList[j].key; // เป็น Attendance อยู่แล้ว 
        totalScore = totalScore + this.scheduleList[j].totalScore;
        sumScore = sumScore + this.studentList[i].assignment[key].score
      }
      console.log(totalScore)
      percentage = (sumScore * percenConfig / totalScore)
      this.percentageScore.push(percentage)
    }
  }
  findStudentExercisePercent() {
    console.log(this.percentageConfig)
    let sumScore = 0; // ผลบวกคะแนนของ Student
    let totalScore = 0; // คะแนนเต็มที่อาจารย์กำหนด Attendance ไม่ต้องกำหนด
    let percenConfig = this.percentageConfig.percentExercise;
    let percentage = 0; // เก็บค่าเฉยๆ
    this.percentageScore = []; // เก็บ Array เท่าจำนวน นศ
    for (var i = 0; i < this.studentList.length; i++) {
      sumScore = 0;
      totalScore = 0;
      for (var j = 0; j < this.scheduleList.length; j++) {
        let key = this.scheduleList[j].key; // เป็น Attendance อยู่แล้ว 
        totalScore = totalScore + this.scheduleList[j].totalScore;
        sumScore = sumScore + this.studentList[i].exercise[key].score
      }
      console.log(totalScore)
      percentage = (sumScore * percenConfig / totalScore)
      this.percentageScore.push(percentage)
    }
  }
  findStudentProjectPercent() {
    console.log(this.percentageConfig)
    let sumScore = 0; // ผลบวกคะแนนของ Student
    let totalScore = 0; // คะแนนเต็มที่อาจารย์กำหนด Attendance ไม่ต้องกำหนด
    let percenConfig = this.percentageConfig.percentProject;
    let percentage = 0; // เก็บค่าเฉยๆ
    this.percentageScore = []; // เก็บ Array เท่าจำนวน นศ
    for (var i = 0; i < this.studentList.length; i++) {
      sumScore = 0;
      totalScore = 0;
      for (var j = 0; j < this.scheduleList.length; j++) {
        let key = this.scheduleList[j].key; // เป็น Attendance อยู่แล้ว 
        totalScore = totalScore + this.scheduleList[j].totalScore;
        sumScore = sumScore + this.studentList[i].project[key].score
      }
      console.log(totalScore)
      percentage = (sumScore * percenConfig / totalScore)
      this.percentageScore.push(percentage)
    }
  }




  //  XXXXXXX  XXX      XX
  //  XX   XX  XX       XX  
  //  XXXXXXX  XX       XX  
  //  XX   XX  XX       XX   
  //  XX   XX  XXXXXXX  XXXXXXX

  findPercentage() {
    this.percentageConfig = {}
    let percentAtt, percentHw, percentLab, percentQuiz, percentAssign, percentExercise, percentProject;
    for (var i = 0; i < this.courseList.length; i++) {
      if (this.courseList[i].id == this.courseParam) {
        percentAtt = this.courseList[i].percentAtt;
        percentHw = this.courseList[i].percentHw;
        percentLab = this.courseList[i].percentLab;
        percentQuiz = this.courseList[i].percentQuiz;
        percentAssign = this.courseList[i].percentAssign;
        percentExercise = this.courseList[i].percentExercise;
        percentProject = this.courseList[i].percentProject;
      }
    }
    this.percentageConfig = {
      percentAtt: percentAtt, percentHw: percentHw, percentLab: percentLab, percentQuiz: percentQuiz,
      percentAssign: percentAtt, percentExercise: percentHw, percentProject: percentLab
    }
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
        , 'แก้ไขคะแนน ' + this.selectedEvent
      );
      console.log('บันทึกใหม่')
      this.saveDataOtherEvent(dateId, student, score, count);
      console.log('save ค่า' + dateId, student, score, count)
      this.closeResult = `Closed with: ${result}`;
      this.formDisabled = !this.formDisabled;
    }, (reason) => {
      console.log('ปิด / ยกเลิก')
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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


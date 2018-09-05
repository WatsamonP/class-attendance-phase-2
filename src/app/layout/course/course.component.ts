import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { EventComponent } from './event/event.component'
import { Router, ParamMap, ActivatedRoute, } from '@angular/router';
import { Observable } from 'rxjs';
import { NgbModal, ModalDismissReasons, NgbAlert, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../shared/services/auth.service';
import { AngularFireDatabase } from 'angularfire2/database'
import * as moment from 'moment';
import { EventModel } from '../../shared/models/eventList.model'
import { MessageService } from '../../shared/services/messageService'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss'],
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .dark-modal .modal-content {
      background-color: #292b2c;
      color: white;
    }
    .dark-modal .close {
      color: white;
    }
    .light-blue-backdrop {
      background-color: #5cb3fd;
    }
  `]
})
export class CourseComponent implements OnInit {

  @Input() name;
  closeResult: string;
  confirmButton: string;

  courseObservable: Observable<any>;
  courseItem: Observable<any>;
  selectedEvent: any;
  studentList: any;
  scheduleList: any;
  courseList: any;
  courseParam: any;
  eventParam: string;
  eventList: any;
  eventModel: EventModel;
  model = 1;
  insertStudentForm: FormGroup;
  updateCourseDataForm: FormGroup;
  //กลุ่มแก้ไข
  isFixScore: boolean = false;;  // เปิดช่องแก้ไขคะแนน
  isShowGroup: boolean = false;;  // แสดงกลุ่มเรียน
  isShowPercent: boolean = false;;  // แสดง%
  isShowTotal: boolean = false;;  // แสดงคะแนนรวม
  isShowCountMiss: boolean = false;;  // จำนวนครั้งขาดเรียน
  authUid: String;
  warningMessage: String;
  tempGroupNumber: any;
  csv: any;
  countUploadStudentProgress: Number = 0;
  uploadFlag: boolean = false;
  /*
  eventList = [
    { id: 'attendance', name: "Attendance", fn: true, isClick: true },
    { id: 'quiz', name: "Quiz", fn: true, isClick: false },
    { id: 'hw', name: "Homework", fn: true, isClick: false },
    { id: 'lab', name: "Lab", fn: true, isClick: false },
    { id: 'exercise', name: "Exercise", fn: false, isClick: false },
  ]
  */
  constructor(
    private router: Router,
    private afDb: AngularFireDatabase,
    private modalService: NgbModal,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private _messageService: MessageService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    //init
    this.authUid = this.authService.authInfo$.value.$uid;
    /*
    this.afDb.object(`users/${this.authUid}/course/523495/eventList/attendance`)
      .update({ id: 'attendance', name: "Attendance", fn: true, isClick: true, position: 0 })
    this.afDb.object(`users/${this.authUid}/course/523495/eventList/quiz`)
      .update({ id: 'quiz', name: "Quiz", fn: true, isClick: false, position: 1 })
      this.afDb.object(`users/${this.authUid}/course/523495/eventList/hw`)
      .update({ id: 'hw', name: "Homework", fn: true, isClick: false, position: 2 })
    this.afDb.object(`users/${this.authUid}/course/523495/eventList/lab`)
      .update({ id: 'lab', name: "Lab", fn: true, isClick: false, position: 3 })
      this.afDb.object(`users/${this.authUid}/course/523495/eventList/exercise`)
      .update({ id: 'exercise', name: "Exercise", fn: false, isClick: false, position: 4 })
    */


    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      let cId = params.get('id');
      this.courseParam = params.get('id');
      this.eventParam = String(params.get('event'));

      // Query Couese
      this.courseItem = afDb.object(`users/${this.authUid}/course/${cId}`).valueChanges();

      // Query Student
      afDb.list(`users/${this.authUid}/course/${cId}/students`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(stds => {
        this.studentList = stds;
        return stds.map(item => item.key);
      });
      this.eventList = [];
      this.afDb.list(`users/${this.authUid}/course/${this.courseParam}/eventList`)
        .snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(events => {
          this.eventList = events;
          //console.log(this.eventList)
          /*
          for (var i = 0; i < this.eventList.length; i++) {
            let eventId = this.eventList[i].key;
            if (this.eventParam == eventId) {
              this.eventList[i].isClick = true;
              this.selectedEvent = this.eventList[i];
              //console.log(this.eventList[i].key)
              this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/eventList/${this.eventList[i].key}`)
                .update({ isClick: true })
            } else {
              this.eventList[i].isClick = false;
              this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/eventList/${this.eventList[i].key}`)
                .update({ isClick: false })
            }
          }*/
          return events.map(item => item.key);
        });

      this.insertStudentForm = this.fb.group({
        id: ['', Validators.required],
        name: ['', Validators.required],
        group: ['', Validators.required]
      });

      this.updateCourseDataForm = this.fb.group({
        name: [null, Validators.required],
        groupNo: [Number, Validators.required],
        trimester: [null, Validators.required],
        year: [null, Validators.required],
        abbreviation: '',
        percentAtt: '',
        percentHw: '',
        percentLab: '',
        percentQuiz: '',
        percentAssign: '',
        percentExercise: '',
        percentProject: '',
      });
      this.setInitCourseDataForm();
    });
  }

  ngOnInit() {
    for (var i = 0; i < this.eventList.length; i++) {
      let eventId = this.eventList[i].key;
      if (this.eventParam == eventId) {
        this.eventList[i].isClick = true;
        this.selectedEvent = this.eventList[i];
        //console.log(this.eventList[i].key)
        this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/eventList/${this.eventList[i].key}`)
          .update({ isClick: true })
      } else {
        this.eventList[i].isClick = false;
        this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/eventList/${this.eventList[i].key}`)
          .update({ isClick: false })
      }
    }
  }

  get groupNo() {
    return this.updateCourseDataForm.get('groupNo');
  }

  getName() {
    this.courseItem.subscribe(s => {
      return s.name
    })
    //return 'Watsamon'
  }

  setInitCourseDataForm() {
    this.courseItem.subscribe(item => {
      const val = this.updateCourseDataForm;
      val.patchValue({ name: item.name });
      val.patchValue({ groupNo: item.groupNo });
      this.tempGroupNumber = item.groupNo;
      val.patchValue({ trimester: item.trimester });
      val.patchValue({ year: item.year });
      if (item.abbreviation !== undefined)
        val.patchValue({ abbreviation: item.abbreviation });
      //
      if (item.percentAtt !== undefined)
        val.patchValue({ percentAtt: item.percentAtt });
      if (item.percentHw !== undefined)
        val.patchValue({ percentHw: item.percentHw });
      if (item.percentLab !== undefined)
        val.patchValue({ percentLab: item.percentLab });
      if (item.percentQuiz !== undefined)
        val.patchValue({ percentQuiz: item.percentQuiz });
      if (item.percentAssign !== undefined)
        val.patchValue({ percentAssign: item.percentAssign });
      if (item.percentExercise !== undefined)
        val.patchValue({ percentExercise: item.percentExercise });
      if (item.percentProject !== undefined)
        val.patchValue({ percentProject: item.percentProject });
    })
  }

  isNumber(number) {
    //console.log(number, !Number.isNaN(number))
    return number == null || number == undefined
  }




  public onClickEvent(event) {
    for (var x in this.eventList) {
      if (this.eventList[x].key == event.key) {
        event.isClick = true;
        this.selectedEvent = event;
        this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/eventList/${this.selectedEvent.key}`)
          .update({ isClick: true })
        this.messageToEvent(event, this.courseParam)
      } else {
        this.eventList[x].isClick = false;
        this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/eventList/${this.selectedEvent.key}`)
          .update({ isClick: false })
      }
    }
  }

  public insertNewEvent() {
    //เอาไปเก็บไว้บน DB ด้วยนะ

  }

  messageToEvent(e, course) {
    let event = e.key;
    let courseId = course.id
    this.router.navigate(['/course', course, event]);
  }

  // สร้าง attendace, quiz, homework เพิ่ม
  public onClickCreateEvent(res) {

  }

  public onClickUpdateCourseData() {
    if (this.updateCourseDataForm.invalid) {
      console.log('จำเป็นต้องมีกลุ่มเรียน')
      return false
    }
    const val = this.updateCourseDataForm.value;
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}`).update({
      name: val.name,
      groupNo: val.groupNo,
      trimester: val.trimester,
      year: val.year,
    })

    if (val.abbreviation !== null) {
      this.afDb.object(`users/${this.authUid}/course/${this.courseParam}`).update({
        abbreviation: val.abbreviation
      })
    }
    if (val.percentAtt !== null) {
      this.afDb.object(`users/${this.authUid}/course/${this.courseParam}`).update({
        percentAtt: val.percentAtt
      })
    }
    if (val.percentHw !== null) {
      this.afDb.object(`users/${this.authUid}/course/${this.courseParam}`).update({
        percentHw: val.percentHw
      })
    }
    if (val.percentLab !== null) {
      this.afDb.object(`users/${this.authUid}/course/${this.courseParam}`).update({
        percentLab: val.percentLab
      })
    }
    if (val.percentQuiz !== null) {
      this.afDb.object(`users/${this.authUid}/course/${this.courseParam}`).update({
        percentQuiz: val.percentQuiz
      })
    }
    if (val.percentAssign !== null) {
      this.afDb.object(`users/${this.authUid}/course/${this.courseParam}`).update({
        percentAssign: val.percentAssign
      })
    }
    if (val.percentExercise !== null) {
      this.afDb.object(`users/${this.authUid}/course/${this.courseParam}`).update({
        percentExercise: val.percentExercise
      })
    }
    if (val.percentProject !== null) {
      this.afDb.object(`users/${this.authUid}/course/${this.courseParam}`).update({
        percentProject: val.percentProject
      })
    }
    this.toastr.success('บันทึกการตั้งค่าสำเร็จ');
    setTimeout(() => { location.reload() }, 3000);

  }



  public onClickCreateEventSlot(warningAlert) {
    this.countUploadStudentProgress = 0;
    this.uploadFlag = false;
    if (this.studentList.length == 0) {
      console.log('ไม่มีจ้าาาาา ')
      this.warningMessage = "ยังไม่มีรายชื่อนักศึกษา กรุณาเพิ่มรายชื่อนักศึกษาก่อน คลิกที่ปุ่ม Tools"
      this.openEvent(warningAlert);
      this.closeResult = "d('Cross click')";
      return false;
    } else {
      this.uploadFlag = true;
      this.warningMessage = "ต้องการสร้าง " + this.selectedEvent.name + " ใหม่";
      this.openEvent(warningAlert);
      this.closeResult = "c('Cross click')";
    }
  }

  letCreateEventSlot() {
    console.log('กำลังจะสร้าง ' + this.selectedEvent.name + ' ใหม่นะจ๊ะ')
    let dateId = moment().format("YYYY-MM-DD-HH-mm-ss");
    const authUid = this.authUid;
    let eventName: string = this.selectedEvent.key;

    switch (eventName) {
      case "attendance": {
        this.onCreateAttendance(authUid, this.courseParam, dateId);
        break;
      }
      default: {
        this.onCreateOtherEvent(authUid, this.courseParam, dateId, this.eventParam);
        console.log("Invalid choice");
        break;
      }
    }
  }

  onClickInsertStudentString() {
    const student = this.insertStudentForm.value;
    if (this.insertStudentForm.invalid) {
      return false
    }
    if (this.tempGroupNumber == undefined) {
      console.log('ยังไม่มีกลุ่มจ้า')
    } else if (student.group > this.tempGroupNumber) {
      console.log('กลุ่มเกิน')
    } else {
      this.insertStudent(student);
    }
  }

  onFileSelect(files: FileList) {
    //console.log(files);
    if (files && files.length > 0) {
      let file: File = files.item(0);
      let reader: FileReader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        this.csv = reader.result;
        //console.log(this.csv);
      }
    }
  }


  onUploadcsv() {
    const student = this.insertStudentForm.value;
    var csvArray = this.csv.split(/\r?\n/);
    var csvArray2d = new Array();
    var regex = new RegExp("^[ก-๙a-zA-Z]+\\s[ก-๙a-zA-Z]+$");
    var overgroup = false;
    for (var i = 1; i < csvArray.length - 1; i++) {
      csvArray2d[i] = csvArray[i].split(",");
      if (csvArray2d[i][4] > this.tempGroupNumber)
        overgroup = true;
    }
    //console.log(overgroup)
    if (overgroup)
      console.log('กลุ่มเกินจ้า')
    //this.toastr.warning("จำนวนกลุ่มในไฟล์ csv มากกว่า จำนวนกลุ่มที่สร้างไว้");
    else {
      //console.log(this.studentListArr)
      for (var i = 1; i < csvArray2d.length; i++) {
        if (regex.test(csvArray2d[i][2])) {
          student.id = csvArray2d[i][1];
          student.name = csvArray2d[i][2];
          student.group = csvArray2d[i][4];
          this.insertStudent(student);
          if (i == csvArray2d.length - 1)
            console.log("Upload Successfully")
          //this.toastr.success("Upload Successfully");
        } else {
          console.log("Upload Failed : Please upload UTF-8 Format")
          //this.toastr.error("Upload Failed : Please upload UTF-8 Format");
          break;
        }
      }
    }
    this.csv = "";
  }

  insertStudent(student) {
    this.afDb.object(`users/${this.authUid}/course/${this.courseParam}/students/${student.id}`)
      .update({
        id: student.id,
        name: student.name,
        group: student.group
      })
  }

  onClickDeleteCourse() {
    //let course = this.courseParam;
    this._messageService.filter({
      delete: this.courseParam
    });
    this.router.navigate(['/']);

    //this.afDb.object(`users/${this.authUid}/course/${course}`)
    //  .remove().then(() => location.reload())

  }







  sendMessageToUpdateScore() {
    this.isFixScore = !this.isFixScore;
    this.sendMessageToEvent();
  }

  sendMessageToShowGroup() {
    this.isShowGroup = !this.isShowGroup;
    this.sendMessageToEvent();
  }

  sendMessageToShowPercent() {
    this.isShowPercent = !this.isShowPercent;
    this.sendMessageToEvent();
  }

  sendMessageToShowTotal() {
    this.isShowTotal = !this.isShowTotal;
    this.sendMessageToEvent();
  }

  sendMessageToShowCountMiss() {
    this.isShowCountMiss = !this.isShowCountMiss;
    this.sendMessageToEvent();
  }

  sendMessageToEvent() {
    this._messageService.filter({
      isFixScore: this.isFixScore,
      isShowGroup: this.isShowGroup,
      isShowPercent: this.isShowPercent,
      isShowTotal: this.isShowTotal,
      isShowCountMiss: this.isShowCountMiss
    });
  }


  onCreateAttendance(authUid, course_id, dateId) {
    this.countUploadStudentProgress = 0
    this.afDb.object(`users/${authUid}/course/${course_id}/schedule/attendance/${dateId}`)
      .update({
        id: dateId,
        date: Date(),
        lateTime: 0,
        lateScore: 0,
        onTimeScore: 0,
        leaveScore: 0,
        countLate: 0,
        countMiss: this.studentList.length,
        countOnTime: 0,
        countLeave: 0,
      });

    for (var i = 0; i < this.studentList.length; i++) {
      setTimeout(() => { this.countUploadStudentProgress = i + 1; }, 300);
      //this.countUploadStudentProgress = i + 1;
      this.afDb.object(`users/${authUid}/course/${course_id}/students/${this.studentList[i].id}/attendance/${dateId}`)
        .update({
          //id: dateId,
          score: 0,
          status: 'Missed Class',
          date: Date(),
        });
    }
    setTimeout(() => { location.reload() }, 3000);
  }

  onCreateOtherEvent(authUid, course_id, dateId, eventKey) {
    this.afDb.object(`users/${authUid}/course/${course_id}/schedule/${eventKey}/${dateId}`)
      .update({
        id: dateId,
        date: Date(),
        totalScore: 0,
        count: 0,
      });

    for (var i = 0; i < this.studentList.length; i++) {
      setTimeout(() => { this.countUploadStudentProgress = i + 1; }, 300);
      this.afDb.object(`users/${authUid}/course/${course_id}/students/${this.studentList[i].id}/${eventKey}/${dateId}`)
        .update({
          //id: dateId,
          score: 0,
          date: Date(),
        });
    }
    setTimeout(() => { location.reload() }, 3000);
  }




  // XXXXXXX  XXXXXXX  XXXXXXX  XX    XX    XX       XX  XXXXXXX  XXXXX    XXXXXXX  XX
  // XX   XX  XX   XX  XX       XXX   XX    XXX     XXX  XX   XX  XX   XX  XX   XX  XX
  // XX   XX  XXXXXXX  XXXXXXX  XX X  XX    XX X   X XX  XX   XX  XX   XX  XXXXXXX  XX
  // XX   XX  XX       XX       XX  X XX    XX  X X  XX  XX   XX  XX   XX  XX   XX  XX
  // XXXXXXX  XX       XXXXXXX  XX   XXX    XX   X   XX  XXXXXXX  XXXXX    XX   XX  XXXXXXX
  public openAndClose(content, close) {
    this.closeResult = "d('Cross click')";
    //this.modalService.open(content);
    this.modalService.open(content, { centered: true });
  }

  public openEvent(content) {
    //this.modalService.open(content);
    this.modalService.open(content, { centered: true });
  }

  openBackDropCustomClass(content) {
    this.modalService.open(content, { backdropClass: 'light-blue-backdrop' });
  }

  openWindowCustomClass(content) {
    this.modalService.open(content, { windowClass: 'dark-modal' });
  }

  openSm(content) {
    this.modalService.open(content, { size: 'sm' });
  }

  openLg(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  openVerticallyCentered(content) {
    this.modalService.open(content, { centered: true });
  }
}

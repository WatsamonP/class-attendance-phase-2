import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from '../../shared/services/auth.service';
import { routerTransition } from '../../router.animations';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.scss'],
  animations: [routerTransition()]
})
export class AddCourseComponent implements OnInit {

  addCourseForm: FormGroup;
  years: any;
  yearsList: number[] = [];
  terms: number[] = [1, 2, 3];
  authUid: String;
  eventInit = [
    //{ id: 'attendance', name: "Attendance", fn: true, isClick: true, position: 0, isSelected: true },
    //{ id: 'quiz', name: "Quiz", fn: true, isClick: false, position: 1, isSelected: true },
    //{ id: 'hw', name: "Homework", fn: true, isClick: false, position: 2, isSelected: true },
    { id: 'lab', name: "Lab", fn: false, isClick: false, isSelected: false },
    { id: 'exercise', name: "Exercise", fn: false, isClick: false, isSelected: false },
    { id: 'assignment', name: "Assignment", fn: false, isClick: false, isSelected: false },
    { id: 'project', name: "Project", fn: false, isClick: false, isSelected: false },
  ]
  eventList = [];
  eventInput: String;
  courseList: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private afDb: AngularFireDatabase,
    private toastr: ToastrService,
  ) {
    const authUid = this.authService.currentUserId;
    //const authUid = this.authService.authInfo$.value.$uid;
    this.eventList = [
      { id: 'attendance', name: "Attendance", fn: true, isClick: true, isSelected: true },
      { id: 'quiz', name: "Quiz", fn: true, isClick: false, isSelected: true },
      { id: 'hw', name: "Homework", fn: true, isClick: false, isSelected: true },
    ];
    // Query
    this.courseList = [];
    afDb.list(`users/${this.authUid}/course/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    }).subscribe(course => {
      this.courseList = course;
      return course.map(item => item.key);
    });
  }

  ngOnInit() {
    //setyearlist
    this.years = new Date().getFullYear() + 543;
    for (var i = 0; i < 5; i++) {
      this.yearsList.push(this.years - i)
    };
    // Form
    this.addCourseForm = this.fb.group({
      id: new FormControl(null, [
        Validators.required,
        Validators.pattern("^[1-9]\\d{5}$")
      ]),
      name: new FormControl(null, [
        Validators.required,
      ]),
      year: new FormControl(null, [
        Validators.required
      ]),
      trimester: new FormControl(null, [
        Validators.required
      ]),
      eventInput: new FormControl(null),
			/*
			group: new FormControl(null, [
				Validators.required
			]),
			*/
    });
  }

  public onClickUserInsertEvent() {
    let eventInput = String(this.addCourseForm.value.eventInput);
    if (/\s/.test(eventInput)) {
      // It has any kind of whitespace
      this.toastr.error('ไม่อนุญาตให้มีช่องว่างในชื่อรายการ','มีช่องว่าง')
      return false;
    }
    
    let id = eventInput.toLowerCase();
    this.eventList.push(
      { id: id, name: eventInput, fn: false, isClick: false, isSelected: true },
    )
    console.log(this.eventList)
  }

  // เพิ่ม event เข้าไปใน eventList // ลบออกจาก eventInit
  onClickinsertEvent(event) {
    console.log(event)
    event.isSelected = true;
    for (var i = 0; i < this.eventInit.length; i++) {
      if (this.eventInit[i].id == event.id) {
        this.eventList.push(event)
        this.eventInit.splice(i, 1)
      }
    }

  }

  // เพิ่ม event เข้าไปใน eventInit // ลบออกจาก eventList
  onClickDisableEvent(event) {
    console.log(event)
    event.isSelected = false;
    for (var i = 0; i < this.eventList.length; i++) {
      if (this.eventList[i].id == event.id) {
        this.eventInit.push(event)
        this.eventList.splice(i, 1)
      }
    }
    console.log(this.eventList)

    //this.eventList.push(

    //)

    //this.eventListSelected.pop()
  }

  onClickSave() {
    if (this.eventList.length == 0) {
      this.toastr.error('ต้องมีรายการเก็บคะแนนอย่างน้อย 1 รายการ');
      return false;
    }
    const val = this.addCourseForm.value;
    for (var i = 0; i < this.courseList.length; i++) {
      if (String(val.id) == String(this.courseList[i].id)) {
        this.toastr.error('รหัสวิชาซ้ำกับ ' + this.courseList[i].name, 'รหัสนี้เคยสร้างแล้ว');
        return false
      }
    }
    
    this.afDb.object(`users/${this.authUid}/course/${val.id}`).update({
      id: val.id,
      name: val.name,
      year: val.year,
      trimester: val.trimester,
      img: 'pic'
    });

    //คะแนนรวม
    this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/score`)
      .update({ id: 'score', name: "Score", fn: true, isClick: false })
    // จำเป็นต้องมี
    //this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/attendance`)
    //  .update({ id: 'attendance', name: "Attendance", fn: true, isClick: true })
    //this.afDb.object(`users/${this.authUid}/course/${val.id}`)
    //  .update({ percentAtt: 0 })
    // อื่นๆ

    for (var i = 0; i < this.eventList.length; i++) {
      if (this.eventList[i].isSelected) {
        //let event = this.eventList[i];
        console.log('เลือก ' + this.eventList[i].name)
        // Set List
        this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/${this.eventList[i].id}`)
          .update({ id: this.eventList[i].id, name: this.eventList[i].name, fn: true, isClick: false })
        // set Percent
        let pString = String('percent'+this.eventList[i].name);
        var obj = {[pString]: 0}
        //let object = {String(pString): 0};
        this.afDb.object(`users/${this.authUid}/course/${val.id}`)
          .update(obj)
        continue;
      }
    }
    /*
    if (this.eventList[0].isSelected) {
      this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/attendance`)
        .update({ id: 'attendance', name: "Attendance", fn: true, isClick: false })
      this.afDb.object(`users/${this.authUid}/course/${val.id}`)
        .update({ percentAtt: 0 })
    }
    
    if (this.eventList[1].isSelected) {
      this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/quiz`)
        .update({ id: 'quiz', name: "Quiz", fn: true, isClick: false })
      this.afDb.object(`users/${this.authUid}/course/${val.id}`)
        .update({ percentQuiz: 0 })
    }
    if (this.eventList[2].isSelected) {
      this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/hw`)
        .update({ id: 'hw', name: "Homework", fn: true, isClick: false })
      this.afDb.object(`users/${this.authUid}/course/${val.id}`)
        .update({ percentHw: 0 })
    }
    if (this.eventList[3].isSelected) {
      this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/lab`)
        .update({ id: 'lab', name: "Lab", fn: true, isClick: false })
      this.afDb.object(`users/${this.authUid}/course/${val.id}`)
        .update({ percentLab: 0 })
    }
    if (this.eventList[4].isSelected) {
      this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/exercise`)
        .update({ id: 'exercise', name: "Exercise", fn: true, isClick: false })
      this.afDb.object(`users/${this.authUid}/course/${val.id}`)
        .update({ percentExercise: 0 })
    }
    if (this.eventList[5].isSelected) {
      this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/assignment`)
        .update({ id: 'assignment', name: "Assignment", fn: true, isClick: false })
      this.afDb.object(`users/${this.authUid}/course/${val.id}`)
        .update({ percentAssign: 0 })
    }
    if (this.eventList[6].isSelected) {
      this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/project`)
        .update({ id: 'project', name: "Project", fn: true, isClick: false })
      this.afDb.object(`users/${this.authUid}/course/${val.id}`)
        .update({ percentProject: 0 })
    }
    */

  }

  public onClickEvent(event) {
    event.isSelected = !event.isSelected;
  }


  //Validators
  get id() {
    return this.addCourseForm.get('id');
  }
  get name() {
    return this.addCourseForm.get('name');
  }
  get year() {
    return this.addCourseForm.get('year');
  }
  get trimester() {
    return this.addCourseForm.get('trimester');
  }
}

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
    { id: 'midterm', name: "Midterm", fn: false, isClick: false, isSelected: false },
    { id: 'final', name: "Final", fn: false, isClick: false, isSelected: false }
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
    this.authUid = this.authService.currentUserId;
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
    if(eventInput.toLowerCase() == 'attendance'){
      this.toastr.error('Attendance เป็น คำสงวน','ผิดพลาด')
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
    if(event.id == 'attendance'){
      this.toastr.error('จำเป็นต้องมี Attendance','ผิดพลาด')
      return false;
    }
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

    for (var i = 0; i < this.eventList.length; i++) {
      if (this.eventList[i].isSelected) {
        //let event = this.eventList[i];
        console.log('เลือก ' + this.eventList[i].name)
        // Set List
        this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/${this.eventList[i].id}`)
          .update({ 
            id: this.eventList[i].id, 
            name: this.eventList[i].name, 
            fn: true, 
            isClick: false,
            isUpdate: false
          })
        // set Percent
        let pString = String('percent'+this.eventList[i].name);
        var obj = {[pString]: 0}
        //let object = {String(pString): 0};
        this.afDb.object(`users/${this.authUid}/course/${val.id}`)
          .update(obj)
        continue;
      }
    }

    this.afDb.object(`users/${this.authUid}/course/${val.id}/group/all`).update({
      id: 'all',
      name: 'All Group',
    });

    this.afDb.object(`users/${this.authUid}/course/${val.id}/gradeList`).update({
      A: 80,
      Bp:75,
      B: 70,
      Cp: 65,
      C: 60,
      Dp: 55,
      D: 50
    });

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

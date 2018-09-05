import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from '../../shared/services/auth.service';
import { format } from 'url';
@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.scss']
})
export class AddCourseComponent implements OnInit {

  addCourseForm: FormGroup;
  years: any;
  yearsList: number[] = [];
  terms: number[] = [1, 2, 3];
  authUid: String;
  eventList = [
    { id: 'attendance', name: "Attendance", fn: true, isClick: true, position: 0, isSelected: true },
    { id: 'quiz', name: "Quiz", fn: true, isClick: false, position: 1, isSelected: true },
    { id: 'hw', name: "Homework", fn: true, isClick: false, position: 2, isSelected: true },
    { id: 'lab', name: "Lab", fn: false, isClick: false, position: 3, isSelected: false },
    { id: 'exercise', name: "Exercise", fn: false, isClick: false, position: 4, isSelected: false },
    { id: 'assignment', name: "Assignmnet", fn: false, isClick: false, position: 5, isSelected: false },
    { id: 'project', name: "Project", fn: false, isClick: false, position: 6, isSelected: false },
  ]

  constructor(private fb: FormBuilder, private authService: AuthService, private afDb: AngularFireDatabase) {
    this.authUid = this.authService.authInfo$.value.$uid;
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
			/*
			group: new FormControl(null, [
				Validators.required
			]),
			*/
    });
  }

  onClickSave() {
    const val = this.addCourseForm.value;
    console.log(`users/${this.authUid}/course/${val.id}`)
    this.afDb.object(`users/${this.authUid}/course/${val.id}`).update({
      id: val.id,
      name: val.name,
      year: val.year,
      trimester: val.trimester,
      img: 'pic'
    });

    // คะแนนรวม
    this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/score`)
      .update({ id: 'score', name: "Score", fn: true, isClick: false })
    // จำเป็นต้องมี
    //this.afDb.object(`users/${this.authUid}/course/${val.id}/eventList/attendance`)
    //  .update({ id: 'attendance', name: "Attendance", fn: true, isClick: true })
    //this.afDb.object(`users/${this.authUid}/course/${val.id}`)
    //  .update({ percentAtt: 0 })
    // อื่นๆ
    for(var i=0; i<this.eventList.length; i++){
      if(this.eventList[i].isSelected){console.log('เลือก '+ this.eventList[i].name)}
    }
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
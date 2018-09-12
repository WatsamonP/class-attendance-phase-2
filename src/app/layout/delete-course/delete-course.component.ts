import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from '../../shared/services/auth.service';
@Component({
  selector: 'app-delete-course',
  templateUrl: './delete-course.component.html',
  styleUrls: ['./delete-course.component.scss']
})
export class DeleteCourseComponent implements OnInit {

  objectKeys = Object.keys;  
  authUid: String;
  courseList: any;

  constructor(private authService: AuthService, private afDb: AngularFireDatabase) {
    //this.authUid = this.authService.authInfo$.value.$uid;
    this.authUid = this.authService.currentUserId;
    
    this.courseList = [];
    afDb.list(`users/${this.authUid}/course/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    }).subscribe(items => {
      this.courseList = items;
      return items.map(item => item.key);
    });
  }

  ngOnInit() {
    
  }

  onClickDelete(course_id){
    console.log('แน่ใจว่าจะลบ');
    this.onDelete(course_id);
  }

  onDelete(course_id){
    console.log('ลบแล้วน๊าาา');
    this.afDb.object(`users/${this.authUid}/course/${course_id}`).remove()
  }

  isEmptyObject(obj) {
    return (obj == undefined || obj == null);
  }
}

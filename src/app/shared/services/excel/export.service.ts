import { Injectable } from '@angular/core';
import { ExcelService } from './excel.service'
import { AuthService } from '../auth.service';
import { AngularFireDatabase } from 'angularfire2/database'

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  authUid: String;
  courseList: any;
  studentList: any;
  scheduleList: any;
  eventList: any;
  course_data: any;;

  data: any = [{
    eid: 'e101',
    ename: 'ravi',
    esal: 1000
  }, {
    eid: 'e102',
    ename: 'ram',
    esal: 2000
  }, {
    eid: 'e103',
    ename: 'rajesh',
    esal: 3000
  }];

  constructor(
    private _excel: ExcelService,
    private authService: AuthService,
    private afDb: AngularFireDatabase
  ) {
    this.authUid = this.authService.currentUserId;

  }

  public exportAsXLSX(courseParam, groupParam) {
    console.log(courseParam, groupParam)
    // Query Course
    this.courseList = []; 
    let course_data = {}
    this.afDb.list(`users/${this.authUid}/course/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    }).subscribe(course => {
      this.courseList = course;
      for (var i = 0; i < this.courseList.length; i++) {
        if (this.courseList[i].id == courseParam) {
          course_data = {
            id: this.courseList[i].id,
            name: this.courseList[i].name,
          }
          break;
        }
      }
      return course.map(item => item.key);
    });

    this.eventList = [];
    this.afDb.list(`users/${this.authUid}/course/${courseParam}/eventList`)
      .snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(events => {
        this.eventList = events;
        return events.map(item => item.key);
      });

    // Query studentList, studentList
    this.studentList = [];
    this.scheduleList = [];
    this.afDb.list(`users/${this.authUid}/course/${courseParam}/schedule`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    }).subscribe(items => {
      this.scheduleList = items;
      if (this.scheduleList.length == 0) {
        console.log('ไม่มี Schedule')
      } else {
        this.afDb.list(`users/${this.authUid}/course/${courseParam}/students`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(stds => {
          this.studentList = [];

          if (groupParam == 'all') { // แสดงทุกกลุ่ม
            this.studentList = stds;      // query นศ
            this.setData(course_data, this.studentList, this.eventList, this.scheduleList, groupParam)
          } else {this.data
            let temp: any = stds;
            for (var i = 0; i < stds.length; i++) {
              if (temp[i].group == groupParam) {
                this.studentList.push(temp[i])
              }
            }
            this.setData(course_data, this.studentList, this.eventList, this.scheduleList, groupParam)
          }
          return stds.map(item => item.key);
        });
      }
      return items.map(item => item.key);
    });
  }

  setData(courseList, studentList, eventList, scheduleList, group) {
    let data: any = [courseList,studentList,eventList, scheduleList, group]
    this.exportAsExcelFile(data)
  }

  exportAsExcelFile(data) {
    this._excel.setWorkSheet(data)
  }
}

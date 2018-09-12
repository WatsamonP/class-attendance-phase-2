import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  testId: string = 'B5800018';
  stdId: string = '';
  found: boolean;
  myData: any[];

  constructor(private _http: Http) { }

  getStudent(): Observable<any> {
    return this._http
      .get('https://classroomfeedback-57c36.firebaseio.com/users/.json')
      .map(response => { 
        return response.json(); 
      });
  }

  getFeedback(student_id, course_id): Observable<any> {
    return this._http
      //.get(`https://classattendence-c4e10.firebaseio.com/users/${student_id}/feedback/${course_id}/.json`)
      .get(`https://classroomfeedback-57c36.firebaseio.com/users/${student_id}/feedback/${course_id}/.json`)
      .map(response => { 
        let obj = {student_id: student_id, feedback: response.json()}
        return obj;
      });
  }

  getStuddent(teacher, courseId, courseData, student_id): Observable<any> {
    return this._http
      .get(`https://classattendence-c4e10.firebaseio.com/users/${teacher.uid}/course/${courseId}/students/${student_id}.json`)
      .map(response => { 
        let obj = {teacher: teacher, course: courseData, student: response.json()}
        return obj; 
      });
  }
}

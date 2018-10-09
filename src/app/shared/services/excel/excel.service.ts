import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import * as moment from 'moment';
import { ignoreElements } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  worksheet: any;
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



  test: any;
  collect: any;

  sheetName: any;
  students: any;
  //eventPerSheet: any;
  studentsPerSheet: any;
  courseDetail: any;
  groupParam: any;
  groupName: String;
  scheduleList: any;
  scheduleKeyList: any;
  percentList: any;


  constructor() { }

  public setWorkSheet(json: any[]): void {
    let workbook: XLSX.WorkBook;
    let worksheet: XLSX.WorkSheet;
    workbook = XLSX.utils.book_new()

    this.courseDetail = json[0];
    this.groupParam = json[4];
    this.percentList = json[5];
    console.log(json)
    if(this.groupParam == 'all'){
      this.groupName = 'AllGroup';
    }else{
      this.groupName = 'Group['+this.groupParam+']';
    }
    this.students = [];
    for (var i = 0; i < json[1].length; i++) {
      this.students[i] = json[1][i];
    }
    this.sheetName = [];
    for (var i = 0; i < json[2].length; i++) {
      this.sheetName[i] = String(json[2][i].name);
    }
    this.scheduleList = [];
    this.scheduleKeyList = []
    for (var i = 0; i < json[3].length; i++) {
      this.scheduleList[i] = json[3][i];
      this.scheduleKeyList[i] = json[3][i].key
    }


    let resFetchOtherEvent = [];
    let collectList = [];
    let studentCollect;
    let excelList = [];
    for (var i = 0; i < this.sheetName.length; i++) {

      if (this.sheetName[i] == 'Score') {
        let res = this.fetchScore();
        for (var s = 0; s < this.students.length; s++) {
          studentCollect = {};
          let collect = {}
          for (var j = 0; j < res.length; j++) {
            collect = Object.assign(collect, res[j][s])

          }
          studentCollect = collect
          if (studentCollect !== undefined) {
            collectList.push(studentCollect)
          }

          if (s == (this.students.length - 1)) {
            excelList.push(collectList);
            collectList = [];
          }
        }

      }else {
        let isNull = true;
        for (var k = 0; k < this.scheduleList.length; k++){
            if (this.percentList[i].event == this.scheduleList[k].key){
              isNull = false;
              resFetchOtherEvent[i] = this.fetchOtherEvent(this.scheduleList[k], this.scheduleKeyList[k]);

              for (var s = 0; s < this.students.length; s++) {
                studentCollect = {};
                let collect = {}
                for (var j = 0; j < resFetchOtherEvent[i].length; j++) {
                  collect = Object.assign(collect, resFetchOtherEvent[i][j][s])

                }
                studentCollect = collect
                if (studentCollect !== undefined) {
                  collectList.push(studentCollect)
                }

                if (s == (this.students.length - 1)) {
                  excelList.push(collectList);
                  collectList = [];
                }
              }
            }
        }
        if (isNull){
          let res = this.nullValue();
          excelList.push(res);
        }

      }


      worksheet = [];
      worksheet[i] = XLSX.utils.json_to_sheet(excelList[i]);
      XLSX.utils.book_append_sheet(workbook, worksheet[i], this.sheetName[i]);
    }
    this.exportAsExcelFile(workbook);
  }

  fetchOtherEvent(scheduleList, scheduleKey) {
    let list = [];
    //let key = Object.keys(this.percentList);
    let key = Object.keys(scheduleList);
    let sKey = Object.keys(this.students);

    for (var i = 0; i < key.length; i++) {
      let date = moment(scheduleList[key[i]].date).format('DD/MM/YYYY');
      let formatedDate = date + '[' + Number(i) + ']';
      let eventId = scheduleList[key[i]].id;

      let student = [];
      let studentSchedule;  // studen
      for (var s = 0; s < sKey.length; s++) {
        if (this.students[sKey[s]][scheduleKey][eventId] !== undefined) {
          let score = this.students[sKey[s]][scheduleKey][eventId].score;
          studentSchedule = { [formatedDate]: score }

          let studentOb = {
            'รหัสนักศึกษา': this.students[sKey[s]].id,
            'ชื่อ-นามสกุล': this.students[sKey[s]].name,
            'กลุ่มเรียน': this.students[sKey[s]].group,
          };
          if (studentOb !== undefined) {
            let ob = Object.assign(studentOb, studentSchedule)
            student.push(ob)
          }

        }
      }
      if (studentSchedule !== undefined) {
        //list.push(studentSchedule)
        list.push(student)
      }
    }
    console.log('===============================')
    return list;
  }

  fetchScore() {
    let list = [];
    let key = Object.keys(this.percentList);
    let sKey = Object.keys(this.students);
    let totalScore = [];
    for (var i = 0; i < key.length; i++) {
      let Column = this.percentList[key[i]].event + '[ ' + this.percentList[key[i]].percent + '% ]';
      let eventId = this.percentList[key[i]].event;
      let student = [];
      let studentScore;  // studen
      for (var s = 0; s < sKey.length; s++) {
        if (i == 0){
          totalScore[s] = 0;
        }
        if (this.percentList[key[i]].event == "total"){
          studentScore = { [Column]: totalScore[s] }
          let studentOb = {
            'รหัสนักศึกษา': this.students[sKey[s]].id,
            'ชื่อ-นามสกุล': this.students[sKey[s]].name,
            'กลุ่มเรียน': this.students[sKey[s]].group,
          };
          if (studentOb !== undefined) {
            let ob = Object.assign(studentOb, studentScore)
            student.push(ob)
          }
        }else if (this.students[sKey[s]].score[eventId] !== undefined) {
          //console.log(this.students[sKey[s]].score[eventId])
          let score = this.students[sKey[s]].score[eventId];
          studentScore = { [Column]: score }
          totalScore[s] += score;
          let studentOb = {
            'รหัสนักศึกษา': this.students[sKey[s]].id,
            'ชื่อ-นามสกุล': this.students[sKey[s]].name,
            'กลุ่มเรียน': this.students[sKey[s]].group,
          };
          if (studentOb !== undefined) {
            let ob = Object.assign(studentOb, studentScore)
            //console.log(ob)
            student.push(ob)
          }
        }else{
          studentScore = { [Column]: 0 }

          let studentOb = {
            'รหัสนักศึกษา': this.students[sKey[s]].id,
            'ชื่อ-นามสกุล': this.students[sKey[s]].name,
            'กลุ่มเรียน': this.students[sKey[s]].group,
          };
          if (studentOb !== undefined) {
            let ob = Object.assign(studentOb, studentScore)
            student.push(ob)
          }
        }
      }
      //console.log(student)
      if (studentScore !== undefined) {
        //list.push(studentSchedule)
        list.push(student)
      }
    }
    return list;
  }

  nullValue() {
    let list = [];
    for (var s = 0; s < this.students.length; s++) {
      let studentOb = {
        'รหัสนักศึกษา': this.students[s].id,
        'ชื่อ-นามสกุล': this.students[s].name,
        'กลุ่มเรียน': this.students[s].group,
      };
      list.push(studentOb)
    }
    return list;
  }




  public exportAsExcelFile(workbook): void {
    console.log(workbook)
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer);
  }

  private saveAsExcelFile(buffer: any): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });

    // Export ชื่่อ
    //export_523211-DATABASE SYSTEMS-Groupall_[30-8-2018]
    FileSaver.saveAs(data,
      'export_'
      + this.courseDetail.id + '-'
      + this.courseDetail.name + '_'
      + this.groupName
      +'__' + new Date().getDate() + '-' + (new Date().getMonth()+1) + '-'+new Date().getFullYear()
      + EXCEL_EXTENSION);
    console.log('สำเร็จ')
  }
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/services/auth.service';
import { AngularFireDatabase } from 'angularfire2/database'
import { Router, ParamMap, ActivatedRoute, } from '@angular/router';
import { MessageService } from '../../../../shared/services/messageService';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  authUid: String;
  feebackList: any;
  courseParam: String;
  attendanceIndex: String;
  commentList: any;
  getFeedbackList: boolean = false;


  list = [
    { date: new Date(), comment: 'ไม่เข้าใจเลยครับ สอนเร็วมาก ', feeling: '', classLabel: 'negative' },
    { date: new Date(), comment: 'อาจารย์สอนเข้าใจมากเลยค่ะ อธิบายด้วยคำพูดที่ไม่ยาก', feeling: '', classLabel: 'positive' },
    { date: new Date(), comment: 'เสียงอาจารย์ทำให้หนูง่วงค่ะ', feeling: '', classLabel: 'negative' },
    { date: new Date(), comment: 'เสียงเบามากค่ะ ทำให้ง่วง', feeling: '', classLabel: 'negative' },
    { date: new Date(), comment: 'อาจารย์สอนสนุกมากเลยค่ะ', feeling: '', classLabel: 'positive' },
  ]

  constructor(
    private activatedRoute: ActivatedRoute, 
    private authService: AuthService, 
    private afDb: AngularFireDatabase,
    private _messageService: MessageService) {
    this.authUid = this.authService.currentUserId;
    this._messageService.listen().subscribe((m: any) => {
      this.getFeedbackList = m.getFeedbackList;
      this.attendanceIndex = m.attendanceIndex;

      console.log(this.getFeedbackList, this.attendanceIndex)
    //})

    //this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      //this.courseParam = params.get('id');
      //this.attendanceIndex = params.get('index');

      this.commentList = [];
      afDb.list(`users/${this.authUid}/course/${this.courseParam}/Feedback/`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(feedback => {
        this.feebackList = feedback[Number(this.attendanceIndex)];
        let number = Object.keys(this.feebackList);
        console.log(number)
        for (var i = 0; i < number.length; i++) {
          if (this.feebackList[number[i]].date !== undefined) {
            let object = {
              date: this.feebackList[number[i]].date,
              comment: this.feebackList[number[i]].comment,
              feeling: this.feebackList[number[i]].feeling,
              classLabel: this.feebackList[number[i]].classLabel
            }
            this.commentList.push(object)
          }

        }
        console.log(this.commentList)

        return feedback.map(item => item.key);
      });
    });
  }

  ngOnInit() {
  }

  emojiPath(emoji) {
    return `assets/reactions/${emoji}.svg`
  }

  emojiPathPng(emoji) {
    return `assets/reactions/${emoji}.png`
  }

}

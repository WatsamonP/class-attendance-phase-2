import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  list = [
    { date: new Date(), comment: 'ไม่เข้าใจเลยครับ สอนเร็วมาก ', feeling: '', classLabel: 'negative'},
    { date: new Date(), comment: 'อาจารย์สอนเข้าใจมากเลยค่ะ อธิบายด้วยคำพูดที่ไม่ยาก', feeling: '', classLabel: 'positive'},
    { date: new Date(), comment: 'เสียงอาจารย์ทำให้หนูง่วงค่ะ', feeling: '', classLabel: 'negative'},
    { date: new Date(), comment: 'เสียงเบามากค่ะ ทำให้ง่วง', feeling: '', classLabel: 'negative'},
    { date: new Date(), comment: 'อาจารย์สอนสนุกมากเลยค่ะ', feeling: '', classLabel: 'positive'},
  ]

  constructor() { }

  ngOnInit() {
  }

  emojiPath(emoji) {
    return `assets/reactions/${emoji}.svg`
  }

  emojiPathPng(emoji) {
    return `assets/reactions/${emoji}.png`
  }

}

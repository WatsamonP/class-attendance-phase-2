import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { AuthService } from "../../shared/services/auth.service";
import { Observable, Subject } from 'rxjs';
import * as moment from 'moment';
import { MessageService } from '../../shared/services/messageService';
import { DataService } from '../../shared/services/data/data.service'
import { format } from 'url';
import { ReactionService } from '../../shared/services/reaction/reaction.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {

  objectKeys = Object.keys;     // เอาไว้ใช้ใน html
  objectNull = Object(null);
  objectUn = Object(undefined);
  public alerts: Array<any> = [];
  public sliders: Array<any> = [];
  courseList: any;
  feedbackListObservable: Observable<any>;
  myKey: any;
  chartLabels: any;
  chartData: any;

  barList: any;
  feedbackList: any;
  itemFeedback: any;
  attendanceObject: any;
  lastAttendance: any;
  courseAttendance: any;
  feedbackAttendanceList: any;
  feedbackLastList: any;

  feelingChart: any;
  feelingLabel: any;

  ///
  //
  pieChartLabels: any;
  pieChartData: any;
  pieChartType: any;
  pieChartColors: any;

  itemExpandHeight: number;

  @Input() itemId: string;
  showEmojis = false;
  emojiList: string[];
  reactionCount: any;
  userReaction: any;
  subscription: any;
  hoverIndex: Number;
  clickIndex: Number;
  isSelectCourse: boolean = false;
  expandList: any;
  lastExpandIndex: Number = -1;

  constructor(
    private authService: AuthService,
    private afDb: AngularFireDatabase,
    private _messageService: MessageService,
    private reactionSvc: ReactionService,
    private _dataService: DataService) {

    this.itemExpandHeight = 300;
    const authUid = this.authService.currentUserId;
    //const authUid = this.authService.authInfo$.value.$uid;
    this.courseList = [];
    this.feedbackList = [];
    this.feedbackLastList = [];
    this.expandList = [];
    afDb.list(`users/${authUid}/course/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    }).subscribe(items => {
      this.courseList = items;
      let object = {}
      let commentList = []
      let ratingObject = {}
      let count0 = 0, count1 = 0, count2 = 0, count3 = 0, count4 = 0, count5 = 0, count6 = 0, count7
      for (var i = 0; i < this.courseList.length; i++) {
        this.expandList.push({ expanded: false })
        object = {}
        ratingObject = {}
        commentList = []
        count0 = 0; count1 = 0; count2 = 0; count3 = 0; count4 = 0; count5 = 0; count6 = 0; count7 = 0;
        if (this.courseList[i].Feedback !== undefined) {
          let fbKey = Object.keys(this.courseList[i].Feedback)
          //for(var j=0; j<fbKey.length; j++){
          let commentOb = Object.keys(this.courseList[i].Feedback[fbKey[fbKey.length - 1]].comment)
          let ratingOb = Object.keys(this.courseList[i].Feedback[fbKey[fbKey.length - 1]].rating)
          let comment;
          let rating;

          for (var k = 0; k < commentOb.length; k++) {
            comment = this.courseList[i].Feedback[fbKey[fbKey.length - 1]].comment[commentOb[k]];
            commentList.push(comment)
          }
          for (var k = 0; k < ratingOb.length; k++) {
            rating = this.courseList[i].Feedback[fbKey[fbKey.length - 1]].rating[ratingOb[k]];
            if (rating == 0) {
              count0++;
            } else if (rating == 1) {
              count1++;
            } else if (rating == 2) {
              count2++;
            } else if (rating == 3) {
              count3++;
            } else if (rating == 4) {
              count4++;
            } else if (rating == 5) {
              count5++;
            } else if (rating == 6) {
              count6++;
            } else if (rating == 7) {
              count7++;
            } else {
              console.log('ERROR')
            }
          }
          ratingObject = {
            count0: count0, count1: count1, count2: count2, count3: count3,
            count4: count4, count5: count5, count6: count6, count7: count7,
          }
          object = { comment: commentList, rating: ratingObject }
          //}
        } else {
          object = { comment: [], rating: 0 }
        }
        this.feedbackLastList.push(object)
        console.log(this.feedbackLastList)
      }
      this.getBarChartData();
      this.getFeelingChart();
      this.getLastAttendance();
      //this.getAttendanceConfig(authUid);
      console.log(this.courseList)
      return items.map(item => item.key);

      //this.emojiList = this.reactionSvc.emojiList;
      /*
            this.subscription = this.reactionSvc.getReactions(this.itemId)
              .valueChanges()
              .subscribe(reactions => {
                //this.reactionCount = this.reactionSvc.countReactions(reactions)
                //this.userReaction = this.reactionSvc.userReaction(reactions)
              })
              */
    });

    this.feedbackListObservable = afDb.object(`Feedbacktest`).valueChanges();

    this.sliders.push(
      {
        imagePath: 'assets/images/slider1.jpg',
        label: 'First slide label',
        text:
          'Nulla vitae elit libero, a pharetra augue mollis interdum.'
      },
      {
        imagePath: 'assets/images/slider2.jpg',
        label: 'Second slide label',
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      },
      {
        imagePath: 'assets/images/slider3.jpg',
        label: 'Third slide label',
        text:
          'Praesent commodo cursus magna, vel scelerisque nisl consectetur.'
      }
    );

    this.alerts.push(
      {
        id: 1,
        type: 'success',
        message: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Voluptates est animi quibusdam praesentium quam, et perspiciatis,
                consectetur velit culpa molestias dignissimos
                voluptatum veritatis quod aliquam! Rerum placeat necessitatibus, vitae dolorum`
      },
      {
        id: 2,
        type: 'warning',
        message: `Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Voluptates est animi quibusdam praesentium quam, et perspiciatis,
                consectetur velit culpa molestias dignissimos
                voluptatum veritatis quod aliquam! Rerum placeat necessitatibus, vitae dolorum`
      }
    );
  }

  ngOnInit() {
    console.log(this.expandList)
    //console.log(this.lastAttendance)
  }

  getAttendanceConfig(authUid) {
    let lasAttendance = [];
    let temp: any;
    this.feedbackAttendanceList = [];
    for (var i = 0; i < this.courseList.length; i++) {
      let attendanceConfig: any;
      let course_id = this.courseList[i].id;
      this.afDb.object(`users/${authUid}/course/${course_id}`).valueChanges()
        .subscribe(res => {
          temp = res;
        })
      lasAttendance.push(temp)
    }


    console.log(lasAttendance)
  }


  public expandedCourseDashboard(index) {
    if (this.lastExpandIndex == index) {
      this.expandList[index].expanded = false;
      this.lastExpandIndex = -1;
    } else {
      for (var i = 0; i < this.expandList.length; i++) {
        if (index == i) {
          this.lastExpandIndex = i;
          this.expandList[i].expanded = true;
        } else {
          this.expandList[i].expanded = false;
        }
      }
    }








    //this.isSelectCourse = !this.isSelectCourse;
  }























  setDefault() {
    console.log('set')
    this.lastAttendance = [
      { index: 0, feeling: 'ยากมาก', count: 0 },
      { index: 1, feeling: 'ยาก', count: 0 },
      { index: 2, feeling: 'ไม่โอเค', count: 0 },
      { index: 3, feeling: 'โอเค', count: 0 },
      { index: 4, feeling: 'ดี', count: 0 },
      { index: 5, feeling: 'ดีมาก', count: 0 },
      { index: 6, feeling: 'น่าเบื่อ', count: 0 },
      { index: 7, feeling: 'ง่วง', count: 0 },
      { index: 8, feeling: 'something', count: 0 }
    ]

    return this.lastAttendance;
  }


  getFeedback(course_id, attendancekey) {
    let tempStudent;
    //this.setDefault();
    this._dataService.getStudent().subscribe(resStd => {
      //let ob = {}
      tempStudent = Object.keys(resStd);
      this.setDefault();
      for (var i = 0; i < tempStudent.length; i++) {
        this._dataService.getFeedback(tempStudent[i], course_id)
          .subscribe((resFeedback) => {
            if (resFeedback.feedback !== null) {
              if (resFeedback.feedback[attendancekey[attendancekey.length - 1]] !== undefined) {
                //console.log(resFeedback.feedback[attendancekey[attendancekey.length-1]])
                let index = resFeedback.feedback[attendancekey[attendancekey.length - 1]].rating;
                this.lastAttendance[index].count = Number(this.lastAttendance[index].count) + 1;
                this.lastAttendance[8].feeling = course_id;
              }
            } else {
              //this.lastAttendance[8].feeling = course_id;
            }
          })
      }
      console.log(this.lastAttendance)
      //let list = []
      //list.push(ob)
      //console.log(list)
    })
  }

  getLastAttendance() {
    this.lastAttendance = [];
    let temp = {};
    for (var i = 0; i < this.courseList.length; i++) {
      temp = {};
      if (this.courseList[i].schedule == undefined || this.courseList[i].schedule.attendance == undefined) {
        temp = {
          countMiss: 0,
          countLate: 0,
          countOnTime: 0,
          countLeave: 0
        }
      } else {
        let attKey = Object.keys(this.courseList[i].schedule.attendance)
        temp = {
          countMiss: this.courseList[i].schedule.attendance[attKey[attKey.length - 1]].countMiss,
          countLate: this.courseList[i].schedule.attendance[attKey[attKey.length - 1]].countLate,
          countOnTime: this.courseList[i].schedule.attendance[attKey[attKey.length - 1]].countOnTime,
          countLeave: this.courseList[i].schedule.attendance[attKey[attKey.length - 1]].countLeave,
          date: this.courseList[i].schedule.attendance[attKey[attKey.length - 1]].date,
        }
      }
      this.lastAttendance.push(temp)
    }
    console.log(this.lastAttendance)
  }
















  isEmptyObject(obj) {
    return (obj == undefined || obj == null);
  }

  getBarChartData() {
    this.lastAttendance = []
    this.barList = [];
    this.chartLabels = [];
    this.chartData = []

    let barCourse = [];
    let labels = [];
    let dataSet = [];
    let dataTemp = [];

    let testSet = [
      [
        { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
        { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series C' }
      ],
      [
        { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
        { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series C' }
      ], [
        { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
        { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
      ]
    ]

    for (var i = 0; i < this.courseList.length; i++) {
      if (!this.isEmptyObject(this.courseList[i].schedule)) {
        this.myKey = Object.keys(this.courseList[i].schedule.attendance);
        barCourse = [];
        labels = [];
        dataSet = [];
        //
        let onTime = [], late = [], miss = [], leave = [];
        for (var k = 0; k < this.myKey.length; k++) {
          //ได้ Object มา
          barCourse.push(this.courseList[i].schedule.attendance[this.myKey[k]])
          // เอาเฉพาะวันที่มาเป็น Labels
          let date = this.courseList[i].schedule.attendance[this.myKey[k]].date;
          let dateShow = moment(date).format("DD-MM-YYYY");
          labels.push(dateShow)
          onTime.push(this.courseList[i].schedule.attendance[this.myKey[k]].countOnTime)
          late.push(this.courseList[i].schedule.attendance[this.myKey[k]].countLate)
          miss.push(this.courseList[i].schedule.attendance[this.myKey[k]].countMiss)
          leave.push(this.courseList[i].schedule.attendance[this.myKey[k]].countLeave)
        }
        dataSet.push(
          { data: onTime, label: 'on Time' },
          { data: miss, label: 'Missed Class' },
          { data: late, label: 'Late' },
          { data: leave, label: 'Leave' }
        )
        this.barList.push(barCourse)
        this.chartLabels.push(labels);
        this.chartData.push(dataSet);
      } else {
        this.barList.push([])
        this.chartLabels.push([]);
        this.chartData.push([]);
      }
    }
    console.log(this.chartData);
    //console.log(testSet);
  }

  test(x) {

  }

  public closeAlert(alert: any) {
    const index: number = this.alerts.indexOf(alert);
    this.alerts.splice(index, 1);
  }

  public chartColors: Array<any> = [
    {
      // green
      backgroundColor: 'rgba(42, 189, 62, 0.4)',
      borderColor: 'rgba(42, 189, 62,1)',
      //pointBackgroundColor: 'rgba(148,159,177,1)',
      //pointBorderColor: '#fff',
      //pointHoverBackgroundColor: '#fff',
      //pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      // red
      backgroundColor: 'rgba(226, 47, 47, 0.4)',
      borderColor: 'rgba(226, 47, 47,1)',
      //pointBackgroundColor: 'rgba(77,83,96,1)',
      //pointBorderColor: '#fff',
      //pointHoverBackgroundColor: '#fff',
      //pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    {
      // yell
      backgroundColor: 'rgba(226, 199, 47, 0.4)',
      borderColor: 'rgba(226, 199, 47,1)',
      //pointBackgroundColor: 'rgba(148,159,177,1)',
      //pointBorderColor: '#fff',
      //pointHoverBackgroundColor: '#fff',
      //pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    {
      // grey
      backgroundColor: 'rgba(148,159,177,0.4)',
      borderColor: 'rgba(148,159,177,1)',
      //pointBackgroundColor: 'rgba(148,159,177,1)',
      //pointBorderColor: '#fff',
      //pointHoverBackgroundColor: '#fff',
      //pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];

  //bar chart
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels: string[] = [
    '2006',
    '2007',
    '2008',
    '2009',
    '2010',
    '2011',
    '2012'
  ];
  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;

  public barChartData: any[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  ];

  // events
  public chartClicked(e: any): void {
    // console.log(e);
  }

  public chartHovered(e: any): void {
    this.emojiPath('fb-like')
  }

  public randomize(): void {
    // Only Change 3 values
    const data = [
      Math.round(Math.random() * 100),
      59,
      80,
      Math.random() * 100,
      56,
      Math.random() * 100,
      40
    ];
    const clone = JSON.parse(JSON.stringify(this.barChartData));
    clone[0].data = data;
    this.barChartData = clone;
    /**
     * (My guess), for Angular to recognize the change in the dataset
     * it has to change the dataset variable directly,
     * so one way around it, is to clone the data, change it and then
     * assign it;
     */
  }



  react(val) {
    if (this.userReaction === val) {
      this.reactionSvc.removeReaction(this.itemId)
    } else {
      this.reactionSvc.updateReaction(this.itemId, val)
    }
  }

  toggleShow() {
    this.showEmojis = !this.showEmojis
  }


  emojiPath(emoji) {
    return `assets/reactions/${emoji}.svg`
  }

  emojiPathPng(emoji) {
    return `assets/reactions/${emoji}.png`
  }

  //hasReactions(index) {
  //  return _.get(this.reactionCount, index.toString())
  //}

  getFeelingChart() {
    let tempLabel;
    let tempData;
    this.pieChartLabels = ['crazy ' + "<img [src]=emojiPath('fb-like) width='45px>"
      , 'cry', 'dead', 'cry-smile', 'smile', 'love', 'bored', 'sleep']
    this.pieChartData = [300, 500, 100, 300, 500, 100, 2, 2];
    this.pieChartType = 'pie';
    this.pieChartColors = [
      'rgba(226, 47, 47, 0.4)', 'rgba(226, 47, 47, 0.4)', 'rgba(226, 47, 47, 0.4)', 'rgba(226, 47, 47, 0.4)',
      'rgba(226, 47, 47, 0.4)', 'rgba(226, 47, 47, 0.4)', 'rgba(226, 47, 47, 0.4)', 'rgba(226, 47, 47, 0.4)',
    ]
  }

  buttonOutlineStyle = [
    'btn-outline-primary','btn-outline-success','btn-outline-danger','btn-outline-warning','btn-outline-info',
    'btn-outline-primary','btn-outline-success','btn-outline-danger','btn-outline-warning','btn-outline-info'
  ];

  buttonStyle = [
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info'
  ];

  borderStyle = [
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info'
  ];

  classColor = [
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info',
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info',
  ]

  // Pie
  //public pieChartLabels: 
  //  string[] = ['crazy','cry', 'dead', 'cry-smile', 'smile', 'love','bored', 'sleep']
  //public pieChartData: number[] = [300, 500, 100,300, 500, 100,2,2];
  //public pieChartType: string = 'pie';

}

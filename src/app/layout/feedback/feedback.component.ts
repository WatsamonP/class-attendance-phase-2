import { Component, OnInit, TemplateRef, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database'
import { Observable, Subject } from 'rxjs';
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { Router, ParamMap, ActivatedRoute, } from '@angular/router';
import { NgbModal, ModalDismissReasons, NgbAlert, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/operators';
import { isNumber } from 'util';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from '../../shared/services/messageService';
import { AuthService } from '../../shared/services/auth.service'

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  providers: [NgbAlertConfig],
})
export class FeedbackComponent implements OnInit {

  authUid: String;
  courseParam: String;
  courseItem: Observable<any>;
  feebackList: any;
  attendanceList: any;
  expandList: any;
  lastExpandIndex: Number = -1;
  commentList: any;
  pieChartLabels: string[];
  pieChartData: number[];
  radarChartData: any[];
  filterComment: any;
  selectedFilter: String;

  constructor(
    private afDb: AngularFireDatabase,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private alertConfig: NgbAlertConfig,
    private _messageService: MessageService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.authUid = this.authService.currentUserId;

    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      let cId = params.get('id');
      this.courseParam = params.get('id');

      // Query Couese
      this.courseItem = afDb.object(`users/${this.authUid}/course/${cId}`).valueChanges();

      this.expandList = [];
      this.attendanceList = [];
      this.feebackList = [];
      afDb.list(`users/${this.authUid}/course/${cId}/schedule/attendance`).snapshotChanges().map(actions => {
        return actions.map(action => ({ key: action.key, ...action.payload.val() }));
      }).subscribe(items => {
        this.attendanceList = items;
        //console.log(this.attendanceList)
        for (var i = 0; i < this.attendanceList.length; i++) {
          this.expandList.push({ expanded: false })
        }
        afDb.list(`users/${this.authUid}/course/${cId}/Feedback/`).snapshotChanges().map(actions => {
          return actions.map(action => ({ key: action.key, ...action.payload.val() }));
        }).subscribe(feedback => {
          this.feebackList = feedback;
          //console.log(this.feebackList)
          return feedback.map(item => item.key);
        });

        return items.map(item => item.key);
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

  public expandedAttendance(index) {
    if (this.lastExpandIndex == index) {
      this.expandList[index].expanded = false;
      this.lastExpandIndex = -1;
    } else {
      for (var i = 0; i < this.expandList.length; i++) {
        if (index == i) {
          this.lastExpandIndex = i;
          this.expandList[i].expanded = true;
          this.getFeedback(i)
        } else {
          this.expandList[i].expanded = false;
        }
      }
    }
  }

  getFeedback(attendanceIndex) {
    this.commentList = [];
    this.afDb.list(`users/${this.authUid}/course/${this.courseParam}/Feedback/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    }).subscribe(feedback => {
      if (feedback[attendanceIndex] !== undefined) {
        this.feebackList = feedback[attendanceIndex];
        let number = Object.keys(this.feebackList);
        for (var i = 0; i < number.length; i++) {
          if (this.feebackList[number[i]].date !== undefined) {
            let object = {
              date: this.feebackList[number[i]].date,
              comment: this.feebackList[number[i]].comment,
              feeling: this.feebackList[number[i]].feeling,
              classLabel: this.feebackList[number[i]].classLabel,
              rating: this.feebackList[number[i]].rating,
              token: this.feebackList[number[i]].token
            }
            this.commentList.push(object)
          }
        }
        if (this.commentList.length !== 0) {
          this.selectedFilter = 'ALL';
          this.filterComment = this.commentList;
          this.setPieChart();
        }
      }
      return feedback.map(item => item.key);
    });
  }

  public filterComments(filter) {
    let temp = this.commentList;
    this.filterComment = [];
    console.log(this.filterComment)
    if (filter == 'all') {
      this.selectedFilter = 'ALL';
      this.filterComment = this.commentList;
    } else {
      for (var i = 0; i < temp.length; i++) {
        if (temp[i].classLabel == filter) {
          this.filterComment.push(temp[i])
        }
      }
      if (filter == 'positive') {
        this.selectedFilter = 'Positive';
      } else if (filter == 'neutral') {
        this.selectedFilter = 'Neutral';
      } else if (filter == 'negative') {
        this.selectedFilter = 'Negative';
      }
    }

  }

  setPieChart() {
    this.pieChartData = [];
    this.radarChartData = [];
    this.pieChartLabels = [
      'Positive',
      'Neutral',
      'Negative'
    ];

    let countLength = this.commentList.length;
    let positive = { data: [0, 0, 0, 0, 0, 0], label: 'Positive' };
    let neutral = { data: [0, 0, 0, 0, 0, 0], label: 'Neutral' };
    let negative = { data: [0, 0, 0, 0, 0, 0], label: 'Negative' };
    let avg = { data: [0, 0, 0, 0, 0, 0], label: 'Average' };

    let p0 = 0, p1 = 0, p2 = 0, p3 = 0, p4 = 0, p5 = 0;
    let ne0 = 0, ne1 = 0, ne2 = 0, ne3 = 0, ne4 = 0, ne5 = 0;
    let n0 = 0, n1 = 0, n2 = 0, n3 = 0, n4 = 0, n5 = 0;
    let countP = 0, countNe = 0, countN = 0;
    for (var i = 0; i < this.commentList.length; i++) {
      if (this.commentList[i].classLabel == 'positive') {
        countP++;
        p0 = p0 + this.commentList[i].rating[0];
        p1 = p1 + this.commentList[i].rating[1];
        p2 = p2 + this.commentList[i].rating[2];
        p3 = p3 + this.commentList[i].rating[3];
        p4 = p4 + this.commentList[i].rating[4];
        p5 = p5 + this.commentList[i].rating[5];
      } else if (this.commentList[i].classLabel == 'neutral') {
        countNe++;
        ne0 = ne0 + this.commentList[i].rating[0];
        ne1 = ne1 + this.commentList[i].rating[1];
        ne2 = ne2 + this.commentList[i].rating[2];
        ne3 = ne3 + this.commentList[i].rating[3];
        ne4 = ne4 + this.commentList[i].rating[4];
        ne5 = ne5 + this.commentList[i].rating[5];
      } else if (this.commentList[i].classLabel == 'negative') {
        countN++;
        n0 = n0 + this.commentList[i].rating[0];
        n1 = n1 + this.commentList[i].rating[1];
        n2 = n2 + this.commentList[i].rating[2];
        n3 = n3 + this.commentList[i].rating[3];
        n4 = n4 + this.commentList[i].rating[4];
        n5 = n5 + this.commentList[i].rating[5];
      }
    }
    // positive
    positive.data[0] = p0 / countP;
    positive.data[1] = p1 / countP;
    positive.data[2] = p2 / countP;
    positive.data[3] = p3 / countP;
    positive.data[4] = p4 / countP;
    positive.data[5] = p5 / countP;
    // neutral
    neutral.data[0] = ne0 / countNe;
    neutral.data[1] = ne1 / countNe;
    neutral.data[2] = ne2 / countNe;
    neutral.data[3] = ne3 / countNe;
    neutral.data[4] = ne4 / countNe;
    neutral.data[5] = ne5 / countNe;
    // negative
    negative.data[0] = n0 / countN;
    negative.data[1] = n1 / countN;
    negative.data[2] = n2 / countN;
    negative.data[3] = n3 / countN;
    negative.data[4] = n4 / countN;
    negative.data[5] = n5 / countN;
    // Average
    avg.data[0] = (p0 + ne0 + n0) / countLength;
    avg.data[1] = (p1 + ne1 + n1) / countLength;
    avg.data[2] = (p2 + ne2 + n2) / countLength;
    avg.data[3] = (p3 + ne3 + n3) / countLength;
    avg.data[4] = (p4 + ne4 + n4) / countLength;
    avg.data[5] = (p5 + ne5 + n5) / countLength;

    this.pieChartData = [countP, countNe, countN];
    this.radarChartData = [avg, positive, neutral, negative];

  }

  public radarChartDataColors: Array<any> = [
    { //primary avg
      backgroundColor: 'rgba(0,153,204,0.4)',
      borderColor: '#33b5e5'
    },
    { // pos
      backgroundColor: 'rgba(0,126,51,0.4)',
      borderColor: '#00C851'
    },
    { // neu
      backgroundColor: 'rgba(255,136,0,0.4)',
      borderColor: '#ffbb33'
    },
    { // neg
      backgroundColor: 'rgba(204,0,0,0.4)',
      borderColor: '#ff4444'
    }
  ];

  public raderOptions: any = {
    responsive: true,
    maintainAspectRatio: true,
    scale: {
      ticks: {
        beginAtZero: true,
        max: 5
      }
    }
  };

  public pieChartDataColors: any[] = [
    {
      backgroundColor: ["#3f903f", "#f8bc44", "#d9534f"]
      //backgroundColor:["rgba(0,126,51,0.95)", "rgba(255,136,0,0.95)", "rgba(204,0,0,0.95)"] ,
      //borderColor:["#00C851", "#ffbb33", "#ff4444"] 
    }
  ];




  // Pie
  /*
  public pieChartLabels: string[] = [
    'Download Sales',
    'In-Store Sales',
    'Mail Sales'
  ];
  public pieChartData: number[] = [300, 500, 100];
  */
  public pieChartType: string = 'pie';




  // Radar
  public radarChartLabels: string[] = [
    'เอกสารและสื่อประกอบการสอน',
    'ประสิทธิภาพการสอน',
    'ความครบถ้วนของเนื้อหา',
    'วิธีการสอนมีความน่าสนใจ',
    'ใช้ภาษาในการสอนที่เหมาะสม',
    'มีการวัดผลผู้เรียน'
  ];
  /*
  public radarChartData: any = [
    { data: [2, 3, 4, 6, 8, 5], label: 'Series A' },
    //{ data: [28, 48, 40, 19, 96, 27], label: 'Series B' }
  ];
  */
  public radarChartType: string = 'radar';

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  /////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////


  buttonOutlineStyle = [
    'btn-outline-primary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
    'btn-outline-primary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
    'btn-outline-primary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
    'btn-outline-primary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
    'btn-outline-primary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
    'btn-outline-primary', 'btn-outline-success', 'btn-outline-danger', 'btn-outline-warning', 'btn-outline-info',
  ];

  buttonStyle = [
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
    'btn-primary', 'btn-success', 'btn-danger', 'btn-warning', 'btn-info',
  ];

  borderStyle = [
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
    'border-primary', 'border-success', 'border-danger', 'border-warning', 'border-info',
  ];

  classColor = [
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info',
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info',
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info',
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info',
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info',
    'text-primary', 'text-success', 'text-danger', 'text-warning', 'text-info'
  ]
}


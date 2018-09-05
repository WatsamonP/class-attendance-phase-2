import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { AngularFireDatabase, AngularFireObject, AngularFireList } from 'angularfire2/database';
import { AuthService } from "../../shared/services/auth.service";
import { Observable, Subject } from 'rxjs';
import * as moment from 'moment';
import { MessageService } from '../../shared/services/messageService';

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

  constructor
  (private authService: AuthService, 
    private afDb: AngularFireDatabase,
    private _messageService: MessageService) {

    const authUid = this.authService.authInfo$.value.$uid;
    
    this.courseList = [];
    afDb.list(`users/${authUid}/course/`).snapshotChanges().map(actions => {
      return actions.map(action => ({ key: action.key, ...action.payload.val() }));
    }).subscribe(items => {
      this.courseList = items;
      this.getBarChartData();
      return items.map(item => item.key);
    });

    this.feedbackListObservable = afDb.object(`Feedbacktest`).valueChanges();

    /*
    afDb.list(`Feedbacktest`).snapshotChanges().map(actions => {
			return actions.map(action => ({ key: action.key, ...action.payload.val() }));
		}).subscribe(items => {
      this.feedbackList = items;
			return items.map(item => item.key);
    });
    */
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

  }

  isEmptyObject(obj) {
    return (obj == undefined || obj == null);
  }

  getBarChartData() {
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
          { data: onTime, label: 'on Time'},
          { data: miss, label: 'Missed Class' },
          { data: late, label: 'Late' },
          { data: leave, label: 'Leave' }
        )
        this.barList.push(barCourse)
        this.chartLabels.push(labels);
        this.chartData.push(dataSet);
      } else {
        this.barList.push(['ไม่มีจ้า'])
        this.chartLabels.push(['ไม่มีจ้า']);
        this.chartData.push(['ไม่มีจ้า']);
      }
    }
    //console.log(this.chartData);
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
    // console.log(e);
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

}

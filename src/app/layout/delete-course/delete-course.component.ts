import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from '../../shared/services/auth.service';
import { NgbModal, ModalDismissReasons, NgbAlert, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-delete-course',
  templateUrl: './delete-course.component.html',
  styleUrls: ['./delete-course.component.scss']
})
export class DeleteCourseComponent implements OnInit {

  objectKeys = Object.keys;
  authUid: String;
  courseList: any;
  closeResult: string;
  @ViewChild('deleteCourse')
  private deleteCourse: TemplateRef<any>;
  deleteMessage: any;

  constructor(
    private authService: AuthService,
    private afDb: AngularFireDatabase,
    private modalService: NgbModal,
    private toastr: ToastrService) {
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

  public onClickDelete(course_id) {
    this.openConfirmDeleteAlert(this.deleteCourse, course_id);
  }

  onDelete(course_id) {
    this.afDb.object(`users/${this.authUid}/course/${course_id}`).remove()
  }

  isEmptyObject(obj) {
    return (obj == undefined || obj == null);
  }

  openConfirmDeleteAlert(content, course) {
    this.deleteMessage = {id: course.id, name: course.name}
    this.modalService.open(content).result.then((result) => {
      this.toastr.success(
        course.id + " : " + course.name, 'ลบรายวิชา'
      );
      console.log('save')
      this.onDelete(course.id)

    }, (reason) => {
      console.log('ปิด / ยกเลิก')
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}

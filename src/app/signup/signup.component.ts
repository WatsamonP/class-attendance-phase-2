import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from "../shared/services/auth.service";
import { UserService } from "../shared/services/user/user.service";
import { Router } from "@angular/router";
import { routerTransition } from '../router.animations';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  animations: [routerTransition()]
})
export class SignupComponent implements OnInit {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() { 
    this.buildForm();
  }

  buildForm(): void {
    this.form = this.fb.group({
      email: new FormControl(null, [
        Validators.required,
        Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[.][a-z]{2,4}$")
      ]),
      password: new FormControl(null, [
        //Validators.pattern('^(?=.*[0–9])(?=.*[a-zA-Z])([a-zA-Z0–9]+)$'),
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(25)
      ]),
      username: new FormControl(null, [
        Validators.required
      ]),
      firstName: new FormControl(null, [
        Validators.required,
        Validators.pattern("^[a-zA-Zก-๙]+$")
      ]),
      lastName: new FormControl(null, [
        Validators.required,
        Validators.pattern("^[a-zA-Zก-๙]+$")
      ]),
      tel: new FormControl(null, [
        Validators.required,
        Validators.pattern("^[0]\\d{8,9}$")
      ])
    });
  }
  //Validators
  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }
  get username() {
    return this.form.get('username');
  }
  get firstName() {
    return this.form.get('firstName');
  }
  get lastName() {
    return this.form.get('lastName');
  }
  get tel() {
    return this.form.get('tel');
  }




  signUp() {
    if (this.form.invalid) {
      console.log("กรุณากรอกข้อมูลให้ครบ");
      //this.toastr.error("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    const val = this.form.value;

    //this.authService.emailLogin(val.email, val.password)
    //localStorage.setItem('isLoggedin', 'true');
    //.then(
      //this.userService.insertUser(val),
      

      //.subscribe(
      //  () => {
          
          //this.toastr.success('สร้างบัญชีผู้ใช้งานสำเร็จ', 'สำเร็จ');
          //this.authService.login(val.email, val.password)
          //this.router.navigateByUrl('/');
        //},
        //err => {
        //  this.toastr.error(err);
        //}
      //);
    //)
  }

  gotoLogin() {
    this.router.navigate(['/signin']);
  }

}
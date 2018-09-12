import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { AuthService } from "../shared/services/auth.service";
import { Router } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { routerTransition } from '../router.animations';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  animations: [routerTransition()]
})
export class SigninComponent implements OnInit {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
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
    });
  }
  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }

  ngOnInit() {
  }

  signInWithEmail(): void {
    const val = this.form.value;

    this.authService.emailLogin(val.email, val.password);
    localStorage.setItem('isLoggedin', 'true');
    //Storage
  }



  /*
  login() {
    if (this.form.invalid) {
      console.log("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    let val = this.form.value;
    this.authService.login(val.email, val.password)
      .subscribe(() => {
        this.toastr.success(val.email+' เข้าสู่ระบบ','สำเร็จ'),
        this.router.navigate(['/'])
      },
        err => this.toastr.error(err)
      );
  }
  */

  signupClick() {
    this.router.navigate(['/signup']);
  }

}

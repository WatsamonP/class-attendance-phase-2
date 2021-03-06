import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {  HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthService {

  authState: any = null;
  userRef: AngularFireObject<any>;

  constructor(private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService) {
      this.afAuth.authState.subscribe((auth) => {
        this.authState = auth
      });
    }

  get authenticated(): boolean {
    return this.authState !== null;
  }
  get currentUser(): any {
    return this.authenticated ? this.authState : null;
  }
  get currentUserObservable(): any {
    return this.afAuth.authState
  }
  get currentUserId(): string {
    return this.authenticated ? this.authState.uid : '';
  }
  get currentUserEmail(): string {
    return this.authenticated ? this.authState.email : '';
  }
  get currentUserAnonymous(): boolean {
    return this.authenticated ? this.authState.isAnonymous : false
  }
  get currentUserDisplayName(): string {
    if (!this.authState) {
      return 'Guest'
    } else if (this.currentUserAnonymous) {
      return 'Anonymous'
    } else {
      return this.authState['displayName'] || 'User without a Name'
    }
  }
  githubLogin() {
    const provider = new firebase.auth.GithubAuthProvider()
    return this.socialSignIn(provider);
  }
  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider()
    return this.socialSignIn(provider);
  }
  facebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider()
    return this.socialSignIn(provider);
  }
  twitterLogin() {
    const provider = new firebase.auth.TwitterAuthProvider()
    return this.socialSignIn(provider);
  }
  private socialSignIn(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        console.log(credential.user);
        this.authState = credential.user
        //this.updateUserData()
        this.router.navigate(['/'])
      })
      .catch(error => console.log(error));
  }
  anonymousLogin() {
    return this.afAuth.auth.signInAnonymously()
      .then((user) => {
        this.authState = user
        this.router.navigate(['/'])
      })
      .catch(error => console.log(error));
  }

  emailSignUp(signUpForm) {
    return this.afAuth.auth.createUserWithEmailAndPassword(signUpForm.email, signUpForm.password)
      .then((user) => {
        this.authState = user
        this.updateUser(signUpForm);
        this.toastr.success("สมัครสมาชิกสำเร็จ");
        this.router.navigate(['/'])
      })
      .catch((error) => {
        console.log(error);
        this.toastr.warning(error,'Error !');
      });
  }
  emailLogin(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((user) => {
        this.authState = user
        //this.updateUserData()
        this.router.navigate(['/dashboard'])
      })
      .catch((error) => {
        console.log(error);
        this.toastr.warning('Email หรือ Password ไม่ถูกต้อง','Error !');
      });
  }
  resetPassword(email: string) {
    const fbAuth = firebase.auth();
    return fbAuth.sendPasswordResetEmail(email)
      .then(() => {
        console.log('email sent');
        this.toastr.success("Send Password Reset to Email");
      })
      .catch((error) => {
        console.log(error);
        this.toastr.warning('Email นี้ยังไม่ได้ลงทะเบียน','Error !');
      });
  }
  getCurrentLoggedIn() {
    this.afAuth.authState.subscribe(auth => {
      if (auth) {
        this.router.navigate(['/'])
      }
    });
  }
  signOut(): void {
    this.afAuth.auth.signOut();
    this.router.navigate(['/signin']);
  }

  private updateUser(user : any){
    this.db.object(`users/${this.afAuth.auth.currentUser.uid}/profile`).update({
      email: user.email,
      firstName : user.firstName,
      lastName : user.lastName,
      tel : user.tel,
      username : user.username
    });
  }

}
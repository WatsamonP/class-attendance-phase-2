import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from 'angularfire2/database';
import { AuthService } from "../auth.service";

@Injectable()
export class UserService {

  //selectedUser: User = new User();
  userList: AngularFireObject<any>;
  currentUserId : string;

  constructor(private db: AngularFireDatabase, private authService: AuthService){ }

  setCurrentUserId(currentUserId : string){
    this.currentUserId = currentUserId;
  }
  

  getUserList(){
    const authUid = this.authService.currentUserId;
    //const authUid = this.authService.authInfo$.value.$uid;
    this.userList = this.db.object(`users/${authUid}/profile`);
    return this.userList;
  }

  insertUser(user : any){
    this.getUserList().set({
      email: user.email,
      firstName : user.firstName,
      lastName : user.lastName,
      tel : user.tel,
      username : user.username
    });
  }

  updateUser(user : any){
    this.getUserList().set({
      email: user.email,
      firstName : user.firstName,
      lastName : user.lastName,
      tel : user.tel,
      username : user.username
    });
  }

  deleteUser(uid : string){
    this.getUserList().remove();
  }

}

import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router';
import { LoginSrvService } from './login-srv.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {

  public showLoginButton: boolean = false;
  public showLogoutButton: boolean = false;
  
  constructor(
    private loginSrv: LoginSrvService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  init() {
    console.debug("INIT START");
    if (this.loginSrv.checkLogin())
    {
      console.debug("HASH FOUND");
      this.showLogoutButton=true;
      this.showLoginButton=false;
    }
    else {
      console.debug("HASH NOT FOUND");
      this.showLoginButton=true;
      this.showLogoutButton=false;
    }
    console.debug("INIT END");
  }

  public logout() {    
    this.loginSrv.logout();
  }

  public login() {
    this.loginSrv.login();    
  }
}

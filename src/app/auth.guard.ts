import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import { LoginSrvService } from './login-srv.service';

@Injectable({
  providedIn: 'root'
})
export class CustomAuthGuard implements CanActivate {

  constructor(private loginSrv: LoginSrvService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    let result = this.loginSrv.hasIDToken();
    console.log("LOGGED IN? "+result);
  
    return of(result);
  }
}

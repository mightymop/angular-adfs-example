import { Injectable } from '@angular/core';
import { LoginServiceHelper } from './auth.service.helper';


@Injectable({
  providedIn: 'root'
})
export class LoginService extends LoginServiceHelper{

  constructor() {
    super('https://dc2019.poldom.local/adfs','633d0b2d-a45e-4e9a-9288-64344f5d19fc',10);
  }
}
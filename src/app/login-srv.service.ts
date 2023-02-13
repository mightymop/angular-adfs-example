import { HttpHeaders,HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Access_token { 
  access_token : string,
  expires_in: number, 
  id_token? : string,
  refresh_token : string,
  refresh_token_expires_in : number,
  resource?: string,
  scope? : string
  token_type: string};

@Injectable({
  providedIn: 'root'
})
export class LoginSrvService {

  private adfsBaseUrl = 'https://dc2019.poldom.local/adfs';
  private clientId = '633d0b2d-a45e-4e9a-9288-64344f5d19fc'

  constructor(private http : HttpClient) { }

  public setIDToken(token: string): void {
    window.localStorage.setItem("id_token",token);    
  }

  public setAuthCode(token: string): void {
    window.localStorage.setItem("auth_code",token);
  }

  public setAccessToken(token: Access_token): void {
    window.localStorage.setItem("access_token",JSON.stringify(token));
  }

  public hasAccessToken(): boolean {
    let access_token = window.localStorage.getItem("access_token");    
    return access_token!==null;
  }

  public hasIDToken(): boolean {
    let id_token = window.localStorage.getItem("id_token");    
    return id_token!==null;
  }

  public getIDToken(): string | undefined {
    let id_token = window.localStorage.getItem("id_token");    
    return id_token!==null?id_token:undefined;
  }

  public getAccessToken(): Access_token | undefined {
    let access_token = window.localStorage.getItem("access_token");    
    return access_token!==null?JSON.parse(access_token):undefined;
  }

  public getAuthCode(): string | undefined {
    let auth_code = window.localStorage.getItem("auth_code");    
    return auth_code!==null?auth_code:undefined;
  }

  checkLogin(): boolean {
    
    if (location.hash&&!this.hasIDToken())
    {
      this.parse();
      this.retrieveAccessToken().subscribe((res:Access_token)=>{
        this.setAccessToken(res);
      });
    }

    return this.hasIDToken();
  }

  private parse() {

    let hash = location.hash.substring(1); //führendes # abschneiden
    let href = location.href.substring(location.href.lastIndexOf("/")+1);
    if (hash==''&&href!='')
    {
      hash=href;
      if (hash.startsWith("?"))
      {
        hash=hash.substring(1);
      }
    }
    let params = hash.split("&");
  
    for (let param of params)
    {
      if (param.startsWith("code"))
      {
        let token = param.substring(param.indexOf("code=")+5);
        console.log("AUTH CODE: "+token);
        console.log("AUTH CODE DECODED: "+decodeURIComponent(token));
        this.setAuthCode(token);
      }
      else
      if (param.startsWith("id_token"))
      {
        let token = param.substring(param.indexOf("id_token=")+9);
        console.log("ID TOKEN: "+token);
        this.setIDToken(token);
      }     
    }
  }

  public retrieveAccessToken() : Observable<any>{
    const headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });
  
    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");    
    body.set("code", encodeURIComponent(this.getAuthCode()!));
    body.set("client_id", this.clientId);
    body.set("redirect_uri", window.location.origin);
   // body.set("requested_token_use","on_behalf_of");
   // body.set("response_type","code");
   // body.set("client_secret", "633d0b2d-a45e-4e9a-9288-64344f5d19fc");
   
    return this.http.post("https://dc2019.poldom.local/adfs/oauth2/token", body.toString(), { headers })
  }

  public refreshAccessToken(): Observable<any>{
    const headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded"
    });

    const body = new URLSearchParams();
    body.set("grant_type", "refresh_token");    
    body.set("refresh_token", this.getAccessToken()!.refresh_token);
    body.set("client_id", this.clientId);
    //body.set("redirect_uri", window.location.origin);
   
    return this.http.post("https://dc2019.poldom.local/adfs/oauth2/token", body.toString(), { headers })
  }

  public logout() {    
    window.localStorage.clear();
    window.location.hash='';
    
    let url = `${this.adfsBaseUrl}/ls/?wa=wsignout1.0&wtrealm=${window.location.origin}`;   
    window.location.href=url;    
  }

  public login() {
    
    const urlparams = new URLSearchParams();
    urlparams.set("response_type", "code id_token");    
    urlparams.set("redirect_uri", window.location.origin);
    urlparams.set("scope", "openid profile email");
    urlparams.set("client_id", this.clientId);
    urlparams.set("nonce","random-nonce");

    let url = `${this.adfsBaseUrl}/oauth2/authorize?${urlparams.toString()}`;   
    window.location.href=url;
  }

}

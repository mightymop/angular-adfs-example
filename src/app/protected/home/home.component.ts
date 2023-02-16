import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { LoginService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent {

  public default: string = "https://dc2019.poldom.local/test_service/test/info";
  public backenddata: any="NIX DA";

  public url: string="";

  constructor(private http: HttpClient, private loginsrv: LoginService)
  {

  }

  onKey(event:any){
    this.url=event.target.value;
  }

  clear() {
    this.backenddata="NIX DA";
  }

  reload() {
    this.getBackendData();
  }

  getBackendData() {
    this.loginsrv.refreshAccessToken().then((access_token:string|undefined)=>{
      if (!access_token)
      {
        console.error("Kein Access Token geladen!");
        return;
      }
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + access_token
      });

      this.http.get(this.url.trim()!=""?this.url.trim():this.default, { headers }).subscribe({
        next: (data:any) => {
          console.log(data);
          this.backenddata=JSON.stringify(data);
        },
        error: (err:any)=>{
          console.error(err);
        }     
      });
    });
  }

}

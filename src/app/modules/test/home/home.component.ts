import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Access_token, LoginSrvService } from 'src/app/login-srv.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit{

  private backendUrl : string = 'https://dc2019.poldom.local/test_service/test/info';
  public backenddata: any="NIX DA";

  constructor(private http: HttpClient, private loginsrv: LoginSrvService)
  {

  }
  
  ngOnInit(): void {
    this.getBackendData();
  }

  clear() {
    this.backenddata="NIX DA";
  }

  reload() {
    this.getBackendData();
  }

  getBackendData() {
    this.loginsrv.refreshAccessToken().subscribe((res:Access_token)=>{
      console.log(res);
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + res.access_token
      });

      this.http.get(this.backendUrl, { headers }).subscribe(data => {
        console.log(data);
        this.backenddata=JSON.stringify(data);
      });
    });
  }

}

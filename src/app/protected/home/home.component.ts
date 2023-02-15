import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { LoginService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit{

  //https://localhost:7039/swagger/index.html
  private backendUrl : string = 'https://localhost:7039/test/info';
  public backenddata: any="NIX DA";

  constructor(private http: HttpClient, private loginsrv: LoginService)
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
    this.loginsrv.refreshAccessToken().subscribe((access_token:string)=>{
      const headers = new HttpHeaders({
        'Authorization': 'Bearer ' + access_token
      });

      this.http.get(this.backendUrl, { headers }).subscribe({
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

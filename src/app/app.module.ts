import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'
import { HttpClientModule } from '@angular/common/http'
import { RouterModule, Routes } from '@angular/router'
import { CustomAuthGuard } from './auth.guard'
import { HomeComponent } from './modules/test/home/home.component'

const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [CustomAuthGuard] },
  { path: '**', redirectTo: '' }
]

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    CustomAuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

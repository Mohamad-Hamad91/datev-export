import { Component, OnInit } from '@angular/core';
import { AuthService } from "../service/auth.service";
import { MessageService } from 'primeng-lts/api';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {


  username: string;
  password: string;

  constructor(private _messageService: MessageService, private _authService: AuthService, private _router: Router, public _translateService: TranslateService) {
    _translateService.addLangs(['de', 'en']);
    _translateService.setDefaultLang('de');
    const browserLang = _translateService.getBrowserLang();
    _translateService.use(browserLang.match(/de|en/) ? browserLang : 'de');
    localStorage.setItem('lang', browserLang);
  }

  ngOnInit(): void {
    this._translateService.get('LOGIN.welcomeMsg').subscribe(elem => { });
  }

  login() {
    const data = {
      username: this.username,
      password: this.password
    };
    this._authService
      .login(data)
      .subscribe(res => {

        if (res && res.user.userinfo) {
          const userInfo = res.user.userinfo;
          const fullName = userInfo.firstname + ' ' + userInfo.lastname;
          const role = userInfo.Role;
          const username = userInfo.username;
          const OrganisationId = userInfo.OrganisationId

          localStorage.setItem('username', username);
          localStorage.setItem('role', role);
          localStorage.setItem('full_name', fullName);
          localStorage.setItem('organisationId', OrganisationId);
          localStorage.setItem('token', res.token);
        }

        // if (localStorage.getItem('role') === "Admin") {
          this._router.navigate(['/dashboard']);
        // } else {
        //   this._router.navigate(['/dashboard/shared/user/procedures']);
        // }

      }, err => { });

  }

  logout() {
    localStorage.clear();
  }

}

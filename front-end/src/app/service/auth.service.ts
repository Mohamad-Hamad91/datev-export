import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  _thisURL = environment.baseUrl + 'as-excel';

  constructor(private _http: HttpClient, private _router: Router) { }

  login(data: any) {
    return this._http.post<any>(this._thisURL + '/login', data);
  }

  resetPassword(data: any) {
    return this._http.post<any>(this._thisURL + '/resetPassword', data);
  }

  changePassword(data: { password: string }) {
    return this._http.post<any>(this._thisURL + '/profile/resetPassword', data);
  }


  adminRegistration(data: any) {
    return this._http.post<any>(this._thisURL + '/adminRegistration', data);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRole() {
    return localStorage.getItem('role');
  }

  logout() {
    localStorage.clear();
    this._router.navigate(['/']);
  }

}

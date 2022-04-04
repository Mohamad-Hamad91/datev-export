import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  authorized = false;
  roles: any;

  constructor(private _authSrvc: AuthService, private _router: Router) { }

  // canActivate(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   return true;
  // }


  canActivate(route: ActivatedRouteSnapshot): boolean {
    this.authorized = false;
    if (this._authSrvc.isLoggedIn()) {
      const currentUserRole = this._authSrvc.getRole();
      
      if (route.data.roles) {
        for (let i = 0; i < route.data.roles.length; i++) {
          if (route.data.roles[i] === currentUserRole) {
            this.authorized = true;
            break;
          }
        }
        // console.log(this.authorized);
        if (this.authorized === false) {
          // console.log('unauthorized from authGuard!');
          this._router.navigate(['/unauthorized']);
        }
        return this.authorized;
      } else {
        return true;
      }
    } else {
      this._router.navigate(['/unauthorized']);
      return false;
    }
  }
  
}

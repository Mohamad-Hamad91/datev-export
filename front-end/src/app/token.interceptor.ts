import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './service/auth.service';
import { MessageService } from 'primeng-lts/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private _authSrvc: AuthService,
    private _messageService: MessageService,
    private _translateService: TranslateService
  ) { }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // return next.handle(request);
    const token = this._authSrvc.getToken();
    const tokenizedReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return new Observable((observer) => {
      next.handle(tokenizedReq).subscribe(
        (res: HttpResponse<any>) => {
          // debugger;
          // if (res instanceof HttpResponse) {
            observer.next(res);
          // }
        },
        (err: HttpErrorResponse) => {
          // debugger;
          if (err.error instanceof ErrorEvent || err.error.fromImport) {
            // console.log('this is client side error');
            // errorMsg = `Error: ${error.error.message}`;
          } else {
            const msg = err.error.msg ?? 'Please_Contact_Developer';
            this._translateService
              .get('ErrorHandler.' + msg)
              .toPromise()
              .then((errorMsg) => {
                this._messageService.add({
                  severity: 'error',
                  summary: 'ERROR!',
                  life: 10000,
                  detail: errorMsg,
                });
              });
          }
          observer.error(err);
        }
      );
    });
  }
}

import { Component } from '@angular/core';
import { BnNgIdleService } from 'bn-ng-idle';
import { PrimeNGConfig } from 'primeng-lts/api';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  constructor(private primengConfig: PrimeNGConfig, private bnIdle: BnNgIdleService,
    private _authService: AuthService) { }

  ngOnInit() {
    this.primengConfig.ripple = true;

    this.bnIdle.startWatching(1800).subscribe((isTimedOut: boolean) => {
      console.log('session expired');
      this._authService.logout();
    });

  }
}

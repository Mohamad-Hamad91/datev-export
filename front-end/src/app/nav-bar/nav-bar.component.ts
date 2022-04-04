import { ChangeDetectorRef, Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng-lts/api';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { HostListener } from "@angular/core";
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.sass'],
})
@Injectable({
  providedIn: 'root'
})
export class NavBarComponent implements OnInit {
  sideBarShow: boolean = false;
  menuItems: MenuItem[] = [];
  userPages: MenuItem[] = [];
  sidebarItems: MenuItem[] = [];
  username: string = localStorage.getItem('username');
  role: string = localStorage.getItem('role');
  browserLang: string = 'de';
  @ViewChild('menu') menu: any;

  constructor(public _translateService: TranslateService, private _authService: AuthService) {
    this._translateService.addLangs(['de', 'en']);
    this._translateService.setDefaultLang('de');
    this.browserLang = this._translateService.getBrowserLang();
    this._translateService.use(this.browserLang.match(/de|en/) ? this.browserLang : 'de');
  }

  async ngOnInit() {
    this.username = localStorage.getItem('username');
    this.role = localStorage.getItem('role');
    this._translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this._translateService.use(event.lang);
      localStorage.setItem('lang', event.lang);
    });
    this.userPages = [
      {
        label: await this._translateService.get('setting').toPromise(),
        icon: 'pi pi-globe',
        visible:
          localStorage.getItem('role') == 'Admin' ||
          localStorage.getItem('role') == 'Manager',
      },
      {
        label: await this._translateService.get('logout').toPromise(),
        icon: 'pi pi-fw pi-power-off',
        command: () => {
          this.logout();
        },
      },
    ];
  }

  getSideBarItems() {
    this.sideBarShow = true;
    this._translateService.get('sideBarMenu').subscribe((elem) => {
      if (this.role === 'Admin') {
        this.sidebarItems = [
          {
            label: 'Administrator',
            items: [{
              label: 'Import',
              icon: 'pi pi-file',
              routerLink: ['/dashboard/import'],
              command: () => { this.sideBarShow = false; },
            },
            ],
          },
        ];
      }
    });
  }

  logout() {
    this._authService.logout();
  }
}

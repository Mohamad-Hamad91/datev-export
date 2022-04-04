import { Component, OnInit } from '@angular/core';
import { Router ,ActivatedRoute} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.sass']
})
export class LayoutComponent implements OnInit {

  username: string = localStorage.getItem('username'); 
  role: string = localStorage.getItem('role');

  constructor(private _route: ActivatedRoute, public _translateService: TranslateService) { }

  ngOnInit(): void {

    this._translateService.setDefaultLang('de');
    this._route.fragment.subscribe(currentRoute => {
      this.role = localStorage.getItem('role');
      this.username = localStorage.getItem('username'); 
    });
    
  }

}

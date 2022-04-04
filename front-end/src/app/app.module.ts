import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng-lts/api';
import { AuthGuard } from './auth.guard';
import { TokenInterceptor } from './token.interceptor';
registerLocaleData(localeDe, 'de');

import { BnNgIdleService } from 'bn-ng-idle';

import { ToastModule } from 'primeng-lts/toast';
import { InputTextModule } from 'primeng-lts/inputtext';
import { ButtonModule } from 'primeng-lts/button';
import { MenuModule } from "primeng-lts/menu";
import { SidebarModule } from "primeng-lts/sidebar";
import { MenubarModule } from "primeng-lts/menubar";
import {MessagesModule} from 'primeng-lts/messages';
import {MessageModule} from 'primeng-lts/message';

import { NavBarComponent } from './nav-bar/nav-bar.component';
import { LayoutComponent } from './layout/layout.component';
import { ImportComponent } from './import/import.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
  // return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavBarComponent,
    LayoutComponent,
    ImportComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ToastModule,
    InputTextModule,
    ButtonModule,
    MenuModule,
    SidebarModule,
    MenubarModule,
    MessagesModule,
    MessageModule,
  ],
  providers: [MessageService, ConfirmationService, AuthGuard, {
    provide: LOCALE_ID,
    useValue: 'de'
  },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    BnNgIdleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

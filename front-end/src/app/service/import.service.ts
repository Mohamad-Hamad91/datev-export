import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImportService {

  _thisURL = environment.baseUrl + 'as-excel';

  constructor(private _http: HttpClient) { }


  uploadFile(formdata) {
    return this._http.post<any>(this._thisURL + '/upload', formdata, {
      reportProgress: true,
      observe: 'events',
      headers: new HttpHeaders({ 'ngsw-bypass': '', responseType: 'text', })
    });
  }

  manipulateFiles() {
    return this._http.get<Blob>(this._thisURL + '/manipulate', { responseType: 'blob' as 'json' });
  }

  importFile(formData) {
    return this._http.post<any>(this._thisURL + '/import', formData);
  }

  deleteFile(data) {
    return this._http.post<any>(this._thisURL + '/delete-file', data);
  }

  addProcedure(procedure) {
    console.log(procedure)
  }
}

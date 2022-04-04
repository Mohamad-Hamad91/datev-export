import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng-lts/api';
import { MessageService } from 'primeng-lts/api';
import { ImportService } from "../service/import.service";
import { FileToImport } from "../model/file-import";
import { TranslateService } from '@ngx-translate/core';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.sass']
})
export class ImportComponent implements OnInit {

  //#region init vars
  items: MenuItem[] = [];
  // array includes uploaded files (not limited in length)
  uploadedFiles: any[] = [];
  // for progress bar
  waiting: boolean = false;
  // an array the files to be imported, contains the properties and the binary file
  filesList: FileToImport[] = new Array();
  // which file we manipulated now
  currentFileIndex: number = -1;
  progress: number = 0;
  //#endregion init vars

  constructor(public _translateService: TranslateService, private _messageService: MessageService,
    private _importService: ImportService, private cdRef: ChangeDetectorRef) {  }

  ngOnInit(): void {  }
  // end of ngOnInit

  removeFormData(index: number) {
    this.filesList.splice(index, 1);
  }

  // to import another file
  addFormData() {
    let f = new FileToImport();
    this.filesList.push(f);
  }

  
  deleteFileFromServer(f: FileToImport, index) {
    this.waiting = true;

    const nameOnServer = f?.nameOnServer;
    if (nameOnServer) {
      this._importService
        .deleteFile({ nameOnServer: nameOnServer })
        .subscribe(res => {
          this.waiting = false;
          this._messageService.add({
            severity: 'success',
            summary: 'File Deleted!',
            detail: 'the file ' + this.filesList[index].orginalName + ' deleted successfuly!'
          });
          this.removeFormData(index);
        },
          err => {
            this.waiting = false;
            this._messageService.add({
              severity: 'warning',
              summary: 'File not Deleted!',
              detail: 'the file ' + this.filesList[index].orginalName + ' not found on the server!'
            });
          });
    } else {
      this._messageService.add({
        severity: 'warning',
        summary: 'File not Deleted!',
        detail: 'There is no file selected!'
      });
    }

  }

  // upload step 1
  uploadFirstStep(f: FileToImport, index) {
    this.waiting = true;
    // send to back-end
    // if type excel to excel-head
    // else if type csv to csv-head
    // else warn user to select type
    // get headers orginal name  and name on the server and set them to f
    const file: File = f?.file;
    const fileType: number = f?.fileType?.value;
    const local: number = f?.local?.value;
    const fileClass: number = f?.fileClass?.value;
    const formData: FormData = new FormData();
    if (!!file) {
      formData.append('excel', file);
    } else {
      this._messageService.add({
        severity: 'warning',
        summary: 'Please choose a file',
        detail: 'You should chose a posting file!'
      });
      return;
    }

    formData.append('data', JSON.stringify({
      fileType: fileType,
      fileClass: fileClass,
      local: local
    }));

    this._importService
      .uploadFile(formData)
      .subscribe((response: any) => {
        switch (response.type) {
          case HttpEventType.Sent:
            // console.log('Request has been made!');
            break;
          case HttpEventType.ResponseHeader:
            // console.log('Response header has been received!');
            break;
          case HttpEventType.UploadProgress:
            this.progress = Math.round(response.loaded / response.total * 100);
            // this.progressElm.nativeElement.style.width = +this.progress + '%';
            this.cdRef.detectChanges();
            // console.log(`Uploaded! ${this.progress}%`);
            break;
          case HttpEventType.Response:
            let res = response.body;

            //#region if upload finished
            this.waiting = false;
            f.fileHeader = new Array();
            for (let index = 0; index < res.headers.length; index++) {
              const element = res.headers[index];
              f.fileHeader.push({ name: element });
            }
            // f.fileHeader = res.headers;
            f.nameOnServer = res.fileName;
            f.orginalName = res.orginalName;
            f.defaultTemplate = res.defaultTemplate;
            f.uploaded = true;
            this.currentFileIndex = index;
            // console.dir(this.filesList);
            this._messageService.add({
              severity: 'success',
              summary: 'File uploaded!',
              detail: 'the file ' + this.filesList[this.currentFileIndex].orginalName + ' uploaded successfuly! you can upload another file now'
            });
            //#endregion if upload finished

            setTimeout(() => {
              this.progress = 0;
              // this.progressElm.nativeElement.style.width = +this.progress + '%';
              this.cdRef.detectChanges();
            }, 1500);
            break;
        } // end of switch
      }, err => {
        // console.log('error: ' + err);
        this.waiting = false;
        this._messageService.add({
          severity: 'error',
          summary: 'ERROR!',
          detail: err.error.msg
        });
      });
  }
  // upload step 1 ends

  // when select a file
  UploadHandler(event, f: FileToImport, index: number) {
    const selectedFiles: FileList = event.files;
    f.file = selectedFiles[0];
    f.index = index;
  }


}
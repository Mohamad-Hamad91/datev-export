
export class FileToImport {

    OrganisationId: number;
    procedureId: number;
    template: any = {};
    defaultTemplate: any = {};
    fileType: any;
    fileClass: any;
    local: any;
    accountType: any;
    size: Number;
    orginalName: string;
    nameOnServer: string;
    file: File;
    index: number;
    uploaded: boolean;
    imported: boolean;
    fileHeader: any = {};
}


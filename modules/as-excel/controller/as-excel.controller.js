const fs = require("fs");
const path = require('path');
const Excel = require('exceljs');
const csv = require('csv-parser');
const parseDecimalNumber = require('parse-decimal-number');
const cldr = require('cldr');

module.exports.deleteFileFromServier = async function (req, res) {
    let message = "file not found";
    let name = path.join(__dirname, '../', './files/' + req.body.nameOnServer?.toLowerCase());
    // console.log(name);
    if (req.body.nameOnServer) {
        fs.unlinkSync(name);
        message = "the file deleted successfully";
    }
    res.status(200).json(message);
};


module.exports.manipulateFiles = async function (req, res) {
    // try open index file
    const workbookReader = new Excel.Workbook();
    //#region get files meta
    let filesMeta = [];
    let indexPath = path.join(__dirname, '../', './files/index.csv');
    const indexWorksheet = await workbookReader.csv.readFile(indexPath);
    indexWorksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
        // console.log("Row " + rowNumber + " = " + JSON.stringify(row.values));
        if (rowNumber > 1) {
            let realValues = row?.values[1]?.split(';');
            // first value will be the file name
            if (realValues[0].toLowerCase().endsWith('.csv')) {
                let fileindex = filesMeta.findIndex(rec => rec.name === realValues[0]);
                if (fileindex >= 0) {
                    //  second value is field name
                    filesMeta[fileindex].fields?.push(realValues[1]);
                    // third value is shorten field name
                    filesMeta[fileindex].abbs?.push(realValues[2]);
                } else {
                    filesMeta.push({
                        name: realValues[0],
                        fields: [realValues[1]],
                        abbs: [realValues[2]]
                    });
                }
            }
        }
    });
    //#endregion end files meta

    //#region create output file
    // open stream out to write
    const resultPath = path.join(__dirname, '../', './files/result.xlsx');
    const options = {
        filename: resultPath,
        useStyles: true,
        useSharedStrings: false
    };
    const workbookOut = new Excel.stream.xlsx.WorkbookWriter(options);

    workbookOut.creator = 'Venator Consulting';
    workbookOut.lastModifiedBy = 'Venator Consulting';
    workbookOut.created = new Date();
    workbookOut.modified = new Date();
    workbookOut.lastPrinted = new Date();
    //#endregion output file

    
    // keep the content of Sachkontenstamm.csv in the ram to search in
    let Sachkontenstamm = [];
    // for each file in the index file 
    for (let i = 0; i < filesMeta.length; i++) {
        const thisFile = filesMeta[i];

        let filePath = path.join(__dirname, '../', './files/' + thisFile.name?.toLowerCase());
        try {
            const errAccess = await fs.promises.access(filePath, fs.constants.R_OK);
            if (errAccess) console.log(`The file ${thisFile.name} not found!`);
            else {
                // create a sheet for the file
                const worksheet = workbookOut.addWorksheet(thisFile.name);
                // set the sheet header
                worksheet.columns = thisFile.fields?.map(field => ({ header: field, key: field }));

                // get the data from the file
                const parser = fs.createReadStream(filePath, { encoding: 'utf8' })
                    .pipe(csv({ separator: ';', encoding: "utf8", headers: false }));

                for await (const row of parser) {
                    let rowValues = [];
                    for (const key in row) {
                        rowValues.push(row[key]?.trim());
                    }
                    worksheet.addRow(rowValues, 'i+').commit();
                    if (thisFile.name?.toLowerCase() == 'sachkontenstamm.csv')
                        Sachkontenstamm.push({ accountNumber: row[0], accountName: row[1] });
                }
            }
        } catch (error) {
            // do nothing
        }
    }

    // add the new sheet

    let filePath = path.join(__dirname, '../', './files/kontobuchungen.csv');
    try {
        const errAccess = await fs.promises.access(filePath, fs.constants.R_OK);
        if (errAccess) console.log(`The file kontobuchungen.csv not found!`);
        else {
            // file name = kontobuchungen.csv
            // sheetName: 'buchungen'
            let originalMeta = filesMeta.find(rec => rec.name?.toLowerCase() === 'kontobuchungen.csv');
            // index of 'kontonummer des kontos'
            let indexOfKonto = originalMeta.fields.findIndex(rec => rec === 'Kontonummer des Kontos');
            originalMeta.fields.splice(indexOfKonto + 1, 0, 'Kontoname');
            // index of 'kontonummer des gegenkontos'
            let indexOfGKName = originalMeta.fields.findIndex(rec => rec === 'Kontonummer des Gegenkontos');
            originalMeta.fields.splice(indexOfGKName + 1, 0, 'GKName');
            // index of 'Umsatz Haben'
            let indexOfHaben = originalMeta.fields.findIndex(rec => rec === 'Umsatz Haben');
            let indexOfSoll = originalMeta.fields.findIndex(rec => rec === 'Umsatz Soll');
            originalMeta.fields.splice(indexOfHaben + 1, 0, 'Saldo');

            // create a sheet for the file
            const worksheet = workbookOut.addWorksheet('buchungen');
            // set the sheet header
            worksheet.columns = originalMeta.fields?.map(field => ({ header: field, key: field }));

            // open the smaller file in buffer to search
            // open the larger file in a stream
            const parser = fs.createReadStream(filePath, { encoding: 'utf8' })
                .pipe(csv({ separator: ';', encoding: "utf8", headers: false }));

                const options = cldr.extractNumberSymbols('de_DE');
    const decimalParser = parseDecimalNumber.withOptions(options);

            // find and calc 3 values
            for await (const row of parser) {
                let rowValues = [];
                for (const key in row) {
                    rowValues.push(row[key]);
                }
                // get the account name
                let name = Sachkontenstamm.find(val => val.accountNumber == rowValues[indexOfKonto])?.accountName;
                let GkName = Sachkontenstamm.find(val => val.accountNumber == rowValues[indexOfGKName])?.accountName;
                rowValues.splice(indexOfKonto + 1, 0, name);
                rowValues.splice(indexOfGKName + 1, 0, GkName);
                let Soll = rowValues[indexOfSoll];
                let Haben = rowValues[indexOfHaben];
                rowValues.splice(indexOfHaben + 1, 0, decimalParser(Soll) - decimalParser(Haben));

                worksheet.addRow(rowValues, 'i+').commit();
            }

        }

    } catch (error) {
        // do nothing
    }
    await workbookOut.commit();
    console.log('finished');
    res.download(resultPath);
}
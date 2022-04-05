const fs = require("fs");
const path = require('path');
const Excel = require('exceljs');
const csv = require('csv-parser');

module.exports.deleteFileFromServier = async function (req, res) {
    let message = "file not found";
    let name = path.join(__dirname, '../', './files/' + req.body.nameOnServer);
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
    let indexPath = path.join(__dirname, '../', './files/Index.csv');
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

    // for each file in the index file 
    for (let i = 0; i < filesMeta.length; i++) {
        const thisFile = filesMeta[i];

        filePath = path.join(__dirname, '../', './files/' + thisFile.name);
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
                        rowValues.push(row[key]);
                    }
                    worksheet.addRow(rowValues, 'i+').commit();
                }
            }
        } catch (error) {
            // do nothing
        }
    }

    await workbookOut.commit();
    console.log('finished');
    res.download(resultPath);
}
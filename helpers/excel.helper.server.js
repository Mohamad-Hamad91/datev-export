const Excel = require('exceljs');
const PostingModel = require('../models/posting.model.server');
const AccountModel = require('../models/accounts.model.server');
const SapWmobel = require('../models/templates/sap.wmobel.template');
const SapCinram = require('../models/templates/sap.cinram.template');
const sequelize = require('../config/sequelize.config');
const templatesTypeEnum = require('../models/enums/template.type');
const AccountTypeEnum = require('../models/enums/account.type');
const getHeaderIndex = require('./index.finder.helper.server').getHeaderIndex;
const { getJsDateFromExcel } = require("excel-date-to-js");

const Exception = require("./errorHandlers/Exception");
const httpStatus = require("../models/enums/httpStatus");

const chrono = require('chrono-node');

const env = require('../config/environment');

const logger = require('../config/logger.config').logger;
const { errorHandler } = require("./error.handler.server");

const sequelizer = sequelize.getSequelize();




module.exports.readHeader = async function (excelFilePath) {

    let fileHeaders = [];
    const workbookReader = new Excel.stream.xlsx.WorkbookReader(excelFilePath);

    for await (const worksheetReader of workbookReader) {
        for await (const row of worksheetReader) {
            for (let i = 0; i < row.model.cells.length; i++) {
                fileHeaders.push(row.model.cells[i].value?.toString().trim());
            }
            break;
        }
    }
    return fileHeaders;
}

/**
 * @param {CellModel}
 * @returns {Date}
 */
getDate = function (cell) {
    if (cell.type === Excel.ValueType.Date) {
        return cell.value;
    } else if (cell.type === Excel.ValueType.Number) {
        return getJsDateFromExcel(cell.value);
    } else if (cell.type === Excel.ValueType.String || cell.type === Excel.ValueType.SharedString) {
        return chrono.de.parseDate(cell.value);
    } else {
        // throw error!
    }
}

/**
 * 
 * @param {string} excelFilePath path of the file on the server
 * @param {JSON} template  
 * @param {number} templateType 1 for SAP or 2 for Cinram, -1 for others
 * @param {string} local localization, not used for excel till now 
 */
module.exports.importStreamExcelFile = async function (excelFilePath, managerId, procedureId, template = null, templateType = 1, local = 'de_DE') {
    const t = await sequelizer.transaction();
    let index = 1;
    let bulkCount = 0;

    let benchmark = process.hrtime();

    return new Promise(async (resolve, reject) => {

        try {

            if (templateType == templatesTypeEnum.SAP_WMOBEL) {
                Standardtemplate = SapWmobel;
            } else if (templateType == templatesTypeEnum.SAP_CINRAM) {
                Standardtemplate = SapCinram.posting;
            } else {
                Standardtemplate = template;
            }

            let rolledBack = false;


            let assignmentIndex = -1;
            let documentNumberIndex = -1;
            let documentTypeIndex = -1;
            let documentDateIndex = -1;
            let recordNumberIndex = -1;
            let creditAmountIndex = -1;
            let transactionCurrencyIndex = -1;
            let applicationDocumentIndex = -1;
            let textPostingIndex = -1;
            let applicationDateIndex = -1;
            let postingDateIndex = -1;
            let companyCodeIndex = -1;
            let fiscalYearIndex = -1;
            let postingPeriodIndex = -1;
            let accountTypeIndex = -1;
            let accountNumberIndex = -1;
            let debitCreditIndex = -1;
            let referenceIndex = -1;
            let GLAccountNumberIndex = -1;
            let contraAccountTypeIndex = -1;
            let contraAccountNumberIndex = -1;
            let contraAccountGLAccountNoIndex = -1;
            let contraAccountCreditorNoIndex = -1;
            let contraAccountDebtorNoIndex = -1;
            let dueDateIndex = -1;
            let textHeaderIndex = -1;
            let accountNameIndex = -1;
            let debtorNumberIndex = -1;
            let creditorNumberIndex = -1;
            let clientIndex = -1;
            let documentNumber2Index = -1;
            let documentTypeNumberIndex = -1;
            let documentTypeNameIndex = -1;
            let documentTypeNewIndex = -1;
            let dueDateNewIndex = -1;
            let executionDateIndex = -1;
            let contraAccountNameIndex = -1;
            let balanceIndex = -1;
            let debitAmountIndex = -1;
            let balanceTransactionCurrencyIndex = -1;
            let debitAmountTransactionCurrencyIndex = -1;
            let creditAmountTransactionCurrencyIndex = -1;
            let exchangeRateIndex = -1;
            let cashDiscountIndex = -1;
            let postingKeyIndex = -1;
            let salesTaxKeyIndex = -1;
            let taxRateIndex = -1;
            let euTaxRateIndex = -1;
            let taxAmountIndex = -1;
            let taxAmountDebitIndex = -1;
            let taxAmountCreditIndex = -1;
            let stackNumberIndex = -1;
            let constCenter1Index = -1;
            let CostCenter2Index = -1;
            let applicationDateNewIndex = -1;
            let identifierBalanceCarryforwardIndex = -1;
            let generalReversalIndex = -1;
            let ledgerIdIndex = -1;
            let documentLinkIndex = -1;
            let typeDocumentInformation1Index = -1;
            let contentDocumentInformation1Index = -1;
            let typeDocumentInformation2Index = -1;
            let contentDocumentInformation2Index = -1;
            let typeDocumentInformation3Index = -1;
            let contentDocumentInformation3Index = -1;
            let typeDocumentInformation4Index = -1;
            let contentDocumentInformation4Index = -1;
            let typeDocumentInformation5Index = -1;
            let contentDocumentInformation5Index = -1;
            let typeDocumentInformation6Index = -1;
            let contentDocumentInformation6Index = -1;
            let typeDocumentInformation7Index = -1;
            let contentDocumentInformation7Index = -1;
            let typeDocumentInformation8Index = -1;
            let contentDocumentInformation8Index = -1;

            let rowsToInsert = [];
            let fileHeaders = [];

            const workbookReader = new Excel.stream.xlsx.WorkbookReader(excelFilePath, {
                includeEmpty: true
            });
            // const worksheetReader = workbookReader.worksheets[0];
            for await (const worksheetReader of workbookReader) {
                // if(worksheetReader.id == 1){
                for await (const row of worksheetReader) {

                    row.eachCell({
                        includeEmpty: true
                    }, (cell, colNo) => {
                        // console.dir(cell.model);
                    });

                    if (index === 1) {

                        for (let i = 0; i < row.model.cells.length; i++) {
                            fileHeaders.push(row.model.cells[i].value?.toString().trim());
                        }
                        assignmentIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'assignment');
                        documentNumberIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'documentNumber');
                        documentTypeIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'documentType');
                        documentDateIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'documentDate');
                        recordNumberIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'recordNumber');
                        creditAmountIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'creditAmount');
                        transactionCurrencyIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'transactionCurrency');
                        applicationDocumentIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'applicationDocument');
                        textPostingIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'textPosting');
                        applicationDateIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'applicationDate');
                        postingDateIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'postingDate');
                        companyCodeIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'companyCode');
                        fiscalYearIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'fiscalYear');
                        postingPeriodIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'postingPeriod');
                        accountTypeIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'accountType');
                        accountNumberIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'accountNumber');
                        debitCreditIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'debitCredit');
                        referenceIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'reference');
                        GLAccountNumberIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'GLAccountNumber');
                        contraAccountTypeIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'contraAccountType');
                        contraAccountNumberIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'contraAccountNumber');
                        contraAccountGLAccountNoIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'contraAccountGLAccountNo');
                        contraAccountCreditorNoIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'contraAccountCreditorNo');
                        contraAccountDebtorNoIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'contraAccountDebtorNo');
                        dueDateIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'dueDate');
                        textHeaderIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'textHeader');
                        accountNameIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'accountName');
                        debtorNumberIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'debtorNumber');
                        creditorNumberIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'creditorNumber');
                        clientIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'client');
                        documentNumber2Index = getHeaderIndex(Standardtemplate, fileHeaders, 'documentNumber2');
                        documentTypeNumberIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'documentTypeNumber');
                        documentTypeNameIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'documentTypeName');
                        documentTypeNewIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'documentTypeNew');
                        dueDateNewIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'dueDate');
                        executionDateIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'executionDate');
                        contraAccountNameIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'contraAccountName');
                        balanceIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'balance');
                        debitAmountIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'debitAmount');
                        balanceTransactionCurrencyIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'balanceTransactionCurrency');
                        debitAmountTransactionCurrencyIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'debitAmountTransactionCurrency');
                        creditAmountTransactionCurrencyIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'creditAmountTransactionCurrency');
                        exchangeRateIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'exchangeRate');
                        cashDiscountIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'cashDiscount');
                        postingKeyIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'postingKey');
                        salesTaxKeyIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'salesTaxKey');
                        taxRateIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'taxRate');
                        euTaxRateIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'euTaxRateIndex');
                        taxAmountIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'taxAmountIndex');
                        taxAmountDebitIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'taxAmountDebit');
                        taxAmountCreditIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'taxAmountCredit');
                        stackNumberIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'stackNumber');
                        constCenter1Index = getHeaderIndex(Standardtemplate, fileHeaders, 'constCenter1');
                        CostCenter2Index = getHeaderIndex(Standardtemplate, fileHeaders, 'CostCenter2');
                        applicationDateNewIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'applicationDateNew');
                        identifierBalanceCarryforwardIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'identifierBalanceCarryforward');
                        generalReversalIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'generalReversal');
                        ledgerIdIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'ledgerId');
                        documentLinkIndex = getHeaderIndex(Standardtemplate, fileHeaders, 'documentLink');
                        typeDocumentInformation1Index = getHeaderIndex(Standardtemplate, fileHeaders, 'typeDocumentInformation1');
                        contentDocumentInformation1Index = getHeaderIndex(Standardtemplate, fileHeaders, 'contentDocumentInformation1');
                        typeDocumentInformation2Index = getHeaderIndex(Standardtemplate, fileHeaders, 'typeDocumentInformation2');
                        contentDocumentInformation2Index = getHeaderIndex(Standardtemplate, fileHeaders, 'contentDocumentInformation2');
                        typeDocumentInformation3Index = getHeaderIndex(Standardtemplate, fileHeaders, 'typeDocumentInformation3');
                        contentDocumentInformation3Index = getHeaderIndex(Standardtemplate, fileHeaders, 'contentDocumentInformation3');
                        typeDocumentInformation4Index = getHeaderIndex(Standardtemplate, fileHeaders, 'typeDocumentInformation4');
                        contentDocumentInformation4Index = getHeaderIndex(Standardtemplate, fileHeaders, 'contentDocumentInformation4');
                        typeDocumentInformation5Index = getHeaderIndex(Standardtemplate, fileHeaders, 'typeDocumentInformation5');
                        contentDocumentInformation5Index = getHeaderIndex(Standardtemplate, fileHeaders, 'contentDocumentInformation5');
                        typeDocumentInformation6Index = getHeaderIndex(Standardtemplate, fileHeaders, 'typeDocumentInformation6');
                        contentDocumentInformation6Index = getHeaderIndex(Standardtemplate, fileHeaders, 'contentDocumentInformation6');
                        typeDocumentInformation7Index = getHeaderIndex(Standardtemplate, fileHeaders, 'typeDocumentInformation7');
                        contentDocumentInformation7Index = getHeaderIndex(Standardtemplate, fileHeaders, 'contentDocumentInformation7');
                        typeDocumentInformation8Index = getHeaderIndex(Standardtemplate, fileHeaders, 'typeDocumentInformation8');
                        contentDocumentInformation8Index = getHeaderIndex(Standardtemplate, fileHeaders, 'contentDocumentInformation8');
                    } else {

                        // push the row to the bulk insert array
                        // don't forget procedure id in accounts
                        // don't forget if procedure id not exist don't go to DB
                        // don't forget to get account type

                        const companyCode = companyCodeIndex >= 0 && row.model.cells[companyCodeIndex] ? row.model.cells[companyCodeIndex].value?.toString().trim() : null;

                        // account
                        const accountType = accountTypeIndex >= 0 && row.model.cells[accountTypeIndex] ? row.model.cells[accountTypeIndex].value?.toString().trim() : null;
                        const accountNumber = accountNumberIndex >= 0 && row.model.cells[accountNumberIndex] ? row.model.cells[accountNumberIndex].value?.toString().trim() : null;
                        let accountName = accountNameIndex >= 0 && row.model.cells[accountNameIndex] ? row.model.cells[accountNameIndex].value?.toString().trim() : null;
                        if (accountNumber && accountType) {
                            let temp = await AccountModel.getAccounts('accounts_' + managerId).findAll({
                                where: {
                                    accountNumber: accountNumber,
                                    procedureId: procedureId,
                                    accountType: accountType
                                },
                                attributes: ['accountName'],
                                limit: 1
                            });
                            accountName = temp.length > 0 ? temp[0].accountName : null;
                        }


                        // contraAccount
                        const contraAccountType = contraAccountTypeIndex >= 0 && row.model.cells[contraAccountTypeIndex] ? row.model.cells[contraAccountTypeIndex].value?.toString().trim() : null;
                        const contraAccountNumber = contraAccountNumberIndex >= 0 && row.model.cells[contraAccountNumberIndex] ? row.model.cells[contraAccountNumberIndex].value?.toString().trim() : null;
                        let contraAccountName = contraAccountNameIndex >= 0 && row.model.cells[contraAccountNameIndex] ? row.model.cells[contraAccountNameIndex].value?.toString().trim() : null;
                        if (contraAccountNumber && contraAccountType) {
                            let temp = await AccountModel.getAccounts('accounts_' + managerId).findAll({
                                where: {
                                    accountNumber: contraAccountNumber,
                                    procedureId: procedureId,
                                    accountType: contraAccountType
                                },
                                attributes: ['accountName'],
                                limit: 1
                            });
                            contraAccountName = temp.length > 0 ? temp[0].accountName : null;
                        }

                        // GlaAccount
                        const GLAccountNumber = GLAccountNumberIndex >= 0 && row.model.cells[GLAccountNumberIndex] ? row.model.cells[GLAccountNumberIndex].value?.toString().trim() : null;
                        let GLAccountName = null;
                        if (GLAccountNumber) {
                            let temp = await AccountModel.getAccounts('accounts_' + managerId).findAll({
                                where: {
                                    accountNumber: GLAccountNumber,
                                    procedureId: procedureId,
                                    accountType: AccountTypeEnum[3]
                                },
                                attributes: ['accountName'],
                                limit: 1
                            });
                            GLAccountName = temp.length > 0 ? temp[0].accountName : null;
                        }

                        // contra gla account 
                        const contraAccountGLAccountNo = contraAccountGLAccountNoIndex >= 0 && row.model.cells[contraAccountGLAccountNoIndex] ? row.model.cells[contraAccountGLAccountNoIndex].value?.toString().trim() : null;
                        let contraAccountGLAccountName = null;
                        if (contraAccountGLAccountNo) {
                            let temp = await AccountModel.getAccounts('accounts_' + managerId).findAll({
                                where: {
                                    accountNumber: contraAccountGLAccountNo,
                                    procedureId: procedureId,
                                    accountType: AccountTypeEnum[3]
                                },
                                attributes: ['accountName'],
                                limit: 1
                            });
                            contraAccountGLAccountName = temp.length > 0 ? temp[0].accountName : null;
                        }


                        // Debitor Account
                        const debtorNumber = debtorNumberIndex >= 0 && row.model.cells[debtorNumberIndex] ? row.model.cells[debtorNumberIndex].value?.toString().trim() : null;
                        let debtorName = null;
                        if (debtorNumber) {
                            let temp = await AccountModel.getAccounts('accounts_' + managerId).findAll({
                                where: {
                                    accountNumber: debtorNumber,
                                    procedureId: procedureId,
                                    accountType: AccountTypeEnum[1]
                                },
                                attributes: ['accountName'],
                                limit: 1
                            });
                            debtorName = temp.length > 0 ? temp[0].accountName : null;
                        }

                        // contra Debitor Account
                        const contraAccountDebtorNo = contraAccountDebtorNoIndex >= 0 && row.model.cells[contraAccountDebtorNoIndex] ? row.model.cells[contraAccountDebtorNoIndex].value?.toString().trim() : null;
                        let contraAccountDebtorName = null;
                        if (contraAccountDebtorNo) {
                            let temp = await AccountModel.getAccounts('accounts_' + managerId).findAll({
                                where: {
                                    accountNumber: contraAccountDebtorNo,
                                    procedureId: procedureId,
                                    accountType: AccountTypeEnum[1]
                                },
                                attributes: ['accountName'],
                                limit: 1
                            });
                            contraAccountDebtorName = temp.length > 0 ? temp[0].accountName : null;
                        }


                        // Credito Account
                        const creditorNumber = creditorNumberIndex >= 0 && row.model.cells[creditorNumberIndex] ? row.model.cells[creditorNumberIndex].value?.toString().trim() : null;
                        let creditorName = null;
                        if (creditorNumber) {
                            let temp = await AccountModel.getAccounts('accounts_' + managerId).findAll({
                                where: {
                                    accountNumber: creditorNumber,
                                    procedureId: procedureId,
                                    accountType: AccountTypeEnum[2]
                                },
                                attributes: ['accountName'],
                                limit: 1
                            });
                            creditorName = temp.length > 0 ? temp[0].accountName : null;
                        }

                        // contra creditor account
                        const contraAccountCreditorNo = contraAccountCreditorNoIndex >= 0 && row.model.cells[contraAccountCreditorNoIndex] ? row.model.cells[contraAccountCreditorNoIndex].value?.toString().trim() : null;
                        let contraAccountCreditorName = null;
                        if (contraAccountCreditorNo) {
                            let temp = await AccountModel.getAccounts('accounts_' + managerId).findAll({
                                where: {
                                    accountNumber: contraAccountCreditorNo,
                                    procedureId: procedureId,
                                    accountType: AccountTypeEnum[2]
                                },
                                attributes: ['accountName'],
                                limit: 1
                            });
                            contraAccountCreditorName = temp.length > 0 ? temp[0].accountName : null;
                        }

                        const creditAmount = creditAmountIndex >= 0 && row.model.cells[creditAmountIndex] ? row.model.cells[creditAmountIndex].value?.toString().trim() : null;
                        // creditAmount = creditAmount ? decimalParser(creditAmount) : null;
                        const debitCredit = debitCreditIndex >= 0 && row.model.cells[debitCreditIndex] ? row.model.cells[debitCreditIndex].value?.toString().trim() : null;
                        // debitCredit = debitCredit ? decimalParser(debitCredit) : null;

                        rowsToInsert.push({
                            accountType: accountType,
                            accountNumber: accountNumber,
                            accountName: accountName,
                            GLAccountNumber: GLAccountNumber,
                            GLAccountName: GLAccountName,
                            contraAccountGLAccountNo: contraAccountGLAccountNo,
                            contraAccountGLAccountName: contraAccountGLAccountName,
                            debtorNumber: debtorNumber,
                            debtorName: debtorName,
                            contraAccountDebtorNo: contraAccountDebtorNo,
                            contraAccountDebtorName: contraAccountDebtorName,
                            creditorNumber: creditorNumber,
                            creditorName: creditorName,
                            contraAccountCreditorNo: contraAccountCreditorNo,
                            contraAccountCreditorName: contraAccountCreditorName,
                            assignment: assignmentIndex >= 0 && row.model.cells[assignmentIndex] ? row.model.cells[assignmentIndex].value?.toString().trim() : null,
                            documentNumber: documentNumberIndex >= 0 && row.model.cells[documentNumberIndex] ? row.model.cells[documentNumberIndex].value?.toString().trim() : null,
                            documentType: documentTypeIndex >= 0 && row.model.cells[documentTypeIndex] ? row.model.cells[documentTypeIndex].value : null,
                            documentDate: documentDateIndex >= 0 && row.model.cells[documentDateIndex] ? getDate(row.model.cells[documentDateIndex]) : null,
                            recordNumber: recordNumberIndex >= 0 && row.model.cells[recordNumberIndex] ? row.model.cells[recordNumberIndex].value : null,
                            creditAmount: creditAmount,
                            transactionCurrency: transactionCurrencyIndex >= 0 && row.model.cells[transactionCurrencyIndex] ? row.model.cells[transactionCurrencyIndex].value : null,
                            applicationDocument: applicationDocumentIndex >= 0 && row.model.cells[applicationDocumentIndex] ? row.model.cells[applicationDocumentIndex].value?.toString().trim() : null,
                            textPosting: textPostingIndex >= 0 && row.model.cells[textPostingIndex] ? row.model.cells[textPostingIndex].value?.toString().trim() : null,
                            applicationDate: applicationDateIndex >= 0 && row.model.cells[applicationDateIndex] ? getDate(row.model.cells[applicationDateIndex]) : null,
                            postingDate: postingDateIndex >= 0 && row.model.cells[postingDateIndex] ? getDate(row.model.cells[postingDateIndex]) : null,
                            companyCode: companyCode,
                            fiscalYear: fiscalYearIndex >= 0 && row.model.cells[fiscalYearIndex] ? row.model.cells[fiscalYearIndex].value?.toString().trim() : null,
                            postingPeriod: postingPeriodIndex >= 0 && row.model.cells[postingPeriodIndex] ? row.model.cells[postingPeriodIndex].value?.toString().trim() : null,
                            debitCredit: debitCredit,
                            reference: referenceIndex >= 0 && row.model.cells[referenceIndex] ? row.model.cells[referenceIndex].value?.toString().trim() : null,
                            contraAccountType: contraAccountType,
                            contraAccountNumber: contraAccountNumber,
                            dueDate: dueDateIndex >= 0 && row.model.cells[dueDateIndex] ? getDate(row.model.cells[dueDateIndex]) : null,
                            textHeader: textHeaderIndex >= 0 && row.model.cells[textHeaderIndex] ? row.model.cells[textHeaderIndex].value?.toString().trim() : null,
                            procedureId: procedureId,
                            client: clientIndex >= 0 && row.model.cells[clientIndex] ? row.model.cells[clientIndex].value?.toString().trim() : null,
                            documentNumber2: documentNumber2Index >= 0 && row.model.cells[documentNumber2Index] ? row.model.cells[documentNumber2Index].value?.toString().trim() : null,
                            documentTypeNumber: documentTypeNumberIndex >= 0 && row.model.cells[documentTypeNumberIndex] ? row.model.cells[documentTypeNumberIndex].value?.toString().trim() : null,
                            documentTypeName: documentTypeNameIndex >= 0 && row.model.cells[documentTypeNameIndex] ? row.model.cells[documentTypeNameIndex].value?.toString().trim() : null,
                            documentTypeNew: documentTypeNewIndex >= 0 && row.model.cells[documentTypeNewIndex] ? row.model.cells[documentTypeNewIndex].value?.toString().trim() : null,
                            dueDateNew: dueDateNewIndex >= 0 && row.model.cells[dueDateNewIndex] ? getDate(row.model.cells[dueDateNewIndex]) : null,
                            executionDate: executionDateIndex >= 0 && row.model.cells[executionDateIndex] ? getDate(row.model.cells[executionDateIndex]) : null,
                            contraAccountName: contraAccountName,
                            balance: balanceIndex >= 0 && row.model.cells[executionDateIndex] ? row.model.cells[balanceIndex].value : null,
                            debitAmount: debitAmountIndex >= 0 && row.model.cells[executionDateIndex] ? row.model.cells[debitAmountIndex].value : null,
                            balanceTransactionCurrency: balanceTransactionCurrencyIndex >= 0 && row.model.cells[balanceTransactionCurrencyIndex] ? row.model.cells[balanceTransactionCurrencyIndex].value : null,
                            debitAmountTransactionCurrency: debitAmountTransactionCurrencyIndex >= 0 && row.model.cells[debitAmountTransactionCurrencyIndex] ? row.model.cells[debitAmountTransactionCurrencyIndex].value : null,
                            creditAmountTransactionCurrency: creditAmountTransactionCurrencyIndex >= 0 && row.model.cells[creditAmountTransactionCurrencyIndex] ? row.model.cells[creditAmountTransactionCurrencyIndex].value : null,
                            exchangeRate: exchangeRateIndex >= 0 && row.model.cells[exchangeRateIndex] ? row.model.cells[exchangeRateIndex].value : null,
                            cashDiscount: cashDiscountIndex >= 0 && row.model.cells[cashDiscountIndex] ? row.model.cells[cashDiscountIndex].value : null,
                            postingKey: postingKeyIndex >= 0 && row.model.cells[postingKeyIndex] ? row.model.cells[postingKeyIndex].value?.toString().trim() : null,
                            salesTaxKey: salesTaxKeyIndex >= 0 && row.model.cells[salesTaxKeyIndex] ? row.model.cells[salesTaxKeyIndex].value?.toString().trim() : null,
                            taxRate: taxRateIndex >= 0 && row.model.cells[taxRateIndex] ? row.model.cells[taxRateIndex].value?.toString().trim() : null,
                            euTaxRate: euTaxRateIndex >= 0 && row.model.cells[euTaxRateIndex] ? row.model.cells[euTaxRateIndex].value?.toString().trim() : null,
                            taxAmount: taxAmountIndex >= 0 && row.model.cells[taxAmountIndex] ? row.model.cells[taxAmountIndex].value : null,
                            taxAmountDebit: taxAmountDebitIndex >= 0 && row.model.cells[taxAmountDebitIndex] ? row.model.cells[taxAmountDebitIndex].value : null,
                            taxAmountCredit: taxAmountCreditIndex >= 0 && row.model.cells[taxAmountCreditIndex] ? row.model.cells[taxAmountCreditIndex].value : null,
                            stackNumber: stackNumberIndex >= 0 && row.model.cells[stackNumberIndex] ? row.model.cells[stackNumberIndex].value?.toString().trim() : null,
                            constCenter1: constCenter1Index >= 0 && row.model.cells[constCenter1Index] ? row.model.cells[constCenter1Index].value?.toString().trim() : null,
                            CostCenter2: CostCenter2Index >= 0 && row.model.cells[CostCenter2Index] ? row.model.cells[CostCenter2Index].value?.toString().trim() : null,
                            applicationDateNew: applicationDateNewIndex >= 0 && row.model.cells[applicationDateNewIndex] ? getDate(row.model.cells[applicationDateNewIndex]) : null,
                            identifierBalanceCarryforward: identifierBalanceCarryforwardIndex >= 0 && row.model.cells[identifierBalanceCarryforwardIndex] ? row.model.cells[identifierBalanceCarryforwardIndex].value : null,
                            generalReversal: generalReversalIndex >= 0 && row.model.cells[generalReversalIndex] ? row.model.cells[generalReversalIndex].value?.toString().trim() : null,
                            ledgerId: ledgerIdIndex >= 0 && row.model.cells[ledgerIdIndex] ? row.model.cells[ledgerIdIndex].value?.toString().trim() : null,
                            documentLink: documentLinkIndex >= 0 && row.model.cells[documentLinkIndex] ? row.model.cells[documentLinkIndex].value?.toString().trim() : null,
                            typeDocumentInformation1: typeDocumentInformation1Index >= 0 && row.model.cells[typeDocumentInformation1Index] ? row.model.cells[typeDocumentInformation1Index].value?.toString().trim() : null,
                            contentDocumentInformation1: contentDocumentInformation1Index >= 0 && row.model.cells[contentDocumentInformation1Index] ? row.model.cells[contentDocumentInformation1Index].value?.toString().trim() : null,
                            typeDocumentInformation2: typeDocumentInformation2Index >= 0 && row.model.cells[typeDocumentInformation2Index] ? row.model.cells[typeDocumentInformation2Index].value?.toString().trim() : null,
                            contentDocumentInformation2: contentDocumentInformation2Index >= 0 && row.model.cells[contentDocumentInformation2Index] ? row.model.cells[contentDocumentInformation2Index].value?.toString().trim() : null,
                            typeDocumentInformation3: typeDocumentInformation3Index >= 0 && row.model.cells[typeDocumentInformation3Index] ? row.model.cells[typeDocumentInformation3Index].value?.toString().trim() : null,
                            contentDocumentInformation3: contentDocumentInformation3Index >= 0 && row.model.cells[contentDocumentInformation3Index] ? row.model.cells[contentDocumentInformation3Index].value?.toString().trim() : null,
                            typeDocumentInformation4: typeDocumentInformation4Index >= 0 && row.model.cells[typeDocumentInformation4Index] ? row.model.cells[typeDocumentInformation4Index].value?.toString().trim() : null,
                            contentDocumentInformation4: contentDocumentInformation4Index >= 0 && row.model.cells[contentDocumentInformation4Index] ? row.model.cells[contentDocumentInformation4Index].value?.toString().trim() : null,
                            typeDocumentInformation5: typeDocumentInformation5Index >= 0 && row.model.cells[typeDocumentInformation5Index] ? row.model.cells[typeDocumentInformation5Index].value?.toString().trim() : null,
                            contentDocumentInformation5: contentDocumentInformation5Index >= 0 && row.model.cells[contentDocumentInformation5Index] ? row.model.cells[contentDocumentInformation5Index].value?.toString().trim() : null,
                            typeDocumentInformation6: typeDocumentInformation6Index >= 0 && row.model.cells[typeDocumentInformation6Index] ? row.model.cells[typeDocumentInformation6Index].value?.toString().trim() : null,
                            contentDocumentInformation6: contentDocumentInformation6Index >= 0 && row.model.cells[contentDocumentInformation6Index] ? row.model.cells[contentDocumentInformation6Index].value?.toString().trim() : null,
                            typeDocumentInformation7: typeDocumentInformation7Index >= 0 && row.model.cells[typeDocumentInformation7Index] ? row.model.cells[typeDocumentInformation7Index].value?.toString().trim() : null,
                            contentDocumentInformation7: contentDocumentInformation7Index >= 0 && row.model.cells[contentDocumentInformation7Index] ? row.model.cells[contentDocumentInformation7Index].value?.toString().trim() : null,
                            typeDocumentInformation8: typeDocumentInformation8Index >= 0 && row.model.cells[typeDocumentInformation8Index] ? row.model.cells[typeDocumentInformation8Index].value?.toString().trim() : null,
                            contentDocumentInformation8: contentDocumentInformation8Index >= 0 && row.model.cells[contentDocumentInformation8Index] ? row.model.cells[contentDocumentInformation8Index].value?.toString().trim() : null,
                        });


                        // if array.length >= env.bulkSize
                        if (rowsToInsert.length >= env.bulkInsertSize) {
                            // then bulk insert and empty the array
                            await PostingModel
                                .getPosting('posting_' + managerId)
                                .bulkCreate(rowsToInsert, {
                                    transaction: t
                                });
                            bulkCount++;
                            const used = process.memoryUsage().heapUsed / 1024 / 1024;
                            console.log(`${new Date()}:The script uses approximately: ${Math.round(used * 100) / 100} MB`);
                            logger.info(`${new Date()}:The script uses approximately: ${Math.round(used * 100) / 100} MB`);
                            rowsToInsert = [];
                            // res.write('event:' + 'progress\n');
                            // res.write('data:' + JSON.stringify({ progress: index }) + '\n\n');
                        } // end of bulk insert batch

                    }
                    index++;
                }
                // if the array not empty: bulk insert it then empty it.
                if (rowsToInsert.length > 0) {
                    // try {
                    await PostingModel
                        .getPosting('posting_' + managerId)
                        .bulkCreate(rowsToInsert, {
                            transaction: t
                        });
                    const used = process.memoryUsage().heapUsed / 1024 / 1024;
                    console.log(`${new Date()}:The script uses approximately: ${Math.round(used * 100) / 100} MB`);
                    logger.info(`${new Date()}:The script uses approximately: ${Math.round(used * 100) / 100} MB`);
                    rowsToInsert = [];
                    // res.write('event:' + 'progress\n');
                    // res.write('data:' + JSON.stringify({ progress: index }) + '\n\n');
                }
                if (!rolledBack) {
                    await t.commit();

                    console.log("the transaction commited successfully :)");
                    logger.info(`${new Date()}:transaction commited successfully for file`);
                    benchmark = process.hrtime(benchmark);
                    console.log('benchmark took %d seconds and %d nanoseconds', benchmark[0], benchmark[1]);
                    logger.info(`${new Date()}:benchmark for import took: ${benchmark[0]} seconds and ${benchmark[1]} nanoseconds for ${index} records`);
                    // res.end();
                    resolve(true);
                }
                // }
            }
            // resolve(true);
        } catch (err) {
            console.log("ERROR, the transaction will Rollback");
            console.error(err);
            const splitedMsg = err.message.split(" at row ");
            if (splitedMsg.length > 1) {
                const rowNum = splitedMsg[1];
                const theRealRowNum = rowNum > 0 ? parseInt(rowNum) + 1 + (bulkCount * env.bulkInsertSize) : index;
                const errorMsg = splitedMsg[0] + ' at row ' + theRealRowNum;
                logger.error(`${new Date()}: ${splitedMsg[0]} at row ${theRealRowNum}`);
                console.log("ERROR on row number: " + theRealRowNum);
                reject(new Exception(httpStatus.BAD_REQUEST, errorMsg, true));
            } else {
                console.log("ERROR on row number: " + index);
                reject(new Exception(httpStatus.BAD_REQUEST, err.message, true));
            }
            // logger.error(`${new Date()}: ${err}`);
            errorHandler("Error", err);
        }


    });



};



/**
 * 
 * @param {string} excelFilePath path of the file on the server
 * @param {AccountTypeEnum} accountType creditor, dibtor or gla
 */
module.exports.importStreamAccountsExcel = async function (excelFilePath, managerId, procedureId, accountType = 1, template = null) {

    let benchmark = process.hrtime();
    let index = 1;
    let bulkCount = 0;

    return new Promise(async (resolve, reject) => {

        try {

            if (template == null) {
                template = {
                    accountNumber: 'KONTO',
                    companyCode: 'BUKR',
                    accountName: 'NAME'
                };
            }

            const t = await sequelizer.transaction();


            let accountNumberIndex = -1;
            let accountTypeIndex = -1;
            let companyCodeIndex = -1;
            let accountNameIndex = -1;
            let accountTypeIdIndex = -1;
            let accountTypeIdInternalIndex = -1;
            let nameAffix1Index = -1;
            let nameAffix2Index = -1;
            let VATIdIndex = -1;
            let taxNumberIndex = -1;
            let streetIndex = -1;
            let postCodeIndex = -1;
            let cityIndex = -1;
            let countryIndex = -1;
            let contactPersonIndex = -1;
            let phoneIndex = -1;
            let emailIndex = -1;
            let bankName1Index = -1;
            let bankSortCode1Index = -1;
            let bankAccountNo1Index = -1;
            let countryCode1Index = -1;
            let iBAN_No1Index = -1;
            let swift_code1Index = -1;
            let differentAccountHolder1Index = -1;
            let bankSortCode2Index = -1;
            let bankName2Index = -1;
            let bankAccountNo2Index = -1;
            let countryCode2Index = -1;
            let iBAN_No2Index = -1;
            let swift_code2Index = -1;
            let differentAccountHolder2Index = -1;
            let bankName3Index = -1;
            let bankAccountNo3Index = -1;
            let countryCode3Index = -1;
            let iBAN_No3Index = -1;
            let swift_code3Index = -1;
            let differentAccountHolder3Index = -1;

            let rowsToInsert = [];
            let fileHeaders = [];

            const workbookReader = new Excel.stream.xlsx.WorkbookReader(excelFilePath, {
                includeEmpty: true
            });
            // const worksheetReader = workbookReader.worksheets[0];
            // fetch sheet by id
            // INFO: Be careful when using it!
            // It tries to access to `worksheet.id` field. Sometimes (really very often) workbook has worksheets with id not starting from 1.
            // For instance It happens when any worksheet has been deleted.
            // .getWorksheet(1);
            for await (const worksheetReader of workbookReader) {
                // if(worksheetReader.id == 1){
                for await (const row of worksheetReader) {

                    row.eachCell({
                        includeEmpty: true
                    }, (cell, colNo) => {
                        // console.dir(cell.model);
                    });

                    if (index === 1) {

                        for (let i = 0; i < row.model.cells.length; i++) {
                            fileHeaders.push(row.model.cells[i].value?.toString().trim());
                        }
                        accountNumberIndex = getHeaderIndex(template, fileHeaders, 'accountNumber');
                        companyCodeIndex = getHeaderIndex(template, fileHeaders, 'companyCode');
                        accountNameIndex = getHeaderIndex(template, fileHeaders, 'accountName');
                        accountTypeIndex = getHeaderIndex(template, fileHeaders, 'accountType');
                        accountTypeIdIndex = getHeaderIndex(template, fileHeaders, 'accountTypeId');
                        accountTypeIdInternalIndex = getHeaderIndex(template, fileHeaders, 'accountTypeIdInternal');
                        nameAffix1Index = getHeaderIndex(template, fileHeaders, 'nameAffix1');
                        nameAffix2Index = getHeaderIndex(template, fileHeaders, 'nameAffix2');
                        VATIdIndex = getHeaderIndex(template, fileHeaders, 'VATId');
                        taxNumberIndex = getHeaderIndex(template, fileHeaders, 'taxNumber');
                        streetIndex = getHeaderIndex(template, fileHeaders, 'street');
                        postCodeIndex = getHeaderIndex(template, fileHeaders, 'postCode');
                        cityIndex = getHeaderIndex(template, fileHeaders, 'city');
                        countryIndex = getHeaderIndex(template, fileHeaders, 'country');
                        contactPersonIndex = getHeaderIndex(template, fileHeaders, 'contactPerson');
                        phoneIndex = getHeaderIndex(template, fileHeaders, 'phone');
                        emailIndex = getHeaderIndex(template, fileHeaders, 'email');
                        bankName1Index = getHeaderIndex(template, fileHeaders, 'bankName1');
                        bankSortCode1Index = getHeaderIndex(template, fileHeaders, 'bankSortCode1');
                        bankAccountNo1Index = getHeaderIndex(template, fileHeaders, 'bankAccountNo1');
                        countryCode1Index = getHeaderIndex(template, fileHeaders, 'countryCode1');
                        iBAN_No1Index = getHeaderIndex(template, fileHeaders, 'iBAN_No1');
                        swift_code1Index = getHeaderIndex(template, fileHeaders, 'swift_code1');
                        differentAccountHolder1Index = getHeaderIndex(template, fileHeaders, 'differentAccountHolder1');
                        bankSortCode2Index = getHeaderIndex(template, fileHeaders, 'bankSortCode2');
                        bankName2Index = getHeaderIndex(template, fileHeaders, 'bankName2');
                        bankAccountNo2Index = getHeaderIndex(template, fileHeaders, 'bankAccountNo2');
                        countryCode2Index = getHeaderIndex(template, fileHeaders, 'countryCode2');
                        iBAN_No2Index = getHeaderIndex(template, fileHeaders, 'iBAN_No2');
                        swift_code2Index = getHeaderIndex(template, fileHeaders, 'swift_code2');
                        differentAccountHolder2Index = getHeaderIndex(template, fileHeaders, 'differentAccountHolder2');
                        bankName3Index = getHeaderIndex(template, fileHeaders, 'bankName3');
                        bankAccountNo3Index = getHeaderIndex(template, fileHeaders, 'bankAccountNo3');
                        countryCode3Index = getHeaderIndex(template, fileHeaders, 'countryCode3');
                        iBAN_No3Index = getHeaderIndex(template, fileHeaders, 'iBAN_No3');
                        swift_code3Index = getHeaderIndex(template, fileHeaders, 'swift_code3');
                        differentAccountHolder3Index = getHeaderIndex(template, fileHeaders, 'differentAccountHolder3');
                    } else {

                        rowsToInsert.push({
                            accountNumber: accountNumberIndex >= 0 && row.model.cells[accountNumberIndex] ? row.model.cells[accountNumberIndex].value?.toString().trim() : null,
                            companyCode: companyCodeIndex >= 0 && row.model.cells[companyCodeIndex] ? row.model.cells[companyCodeIndex].value?.toString().trim() : null,
                            accountName: accountNameIndex >= 0 && row.model.cells[accountNameIndex] ? row.model.cells[accountNameIndex].value?.toString().trim() : null,
                            accountType: AccountTypeEnum[accountType] ? AccountTypeEnum[accountType] : row.model.cells[accountTypeIndex] ? row.model.cells[accountTypeIndex].value?.toString().trim() : null,
                            procedureId: procedureId,
                            accountTypeId: accountTypeIdIndex >= 0 && row.model.cells[accountTypeIdIndex] ? row.model.cells[accountTypeIdIndex].value : null,
                            accountTypeIdInternal: accountTypeIdInternalIndex >= 0 && row.model.cells[accountTypeIdInternalIndex] ? row.model.cells[accountTypeIdInternalIndex].value?.toString().trim() : null,
                            nameAffix1: nameAffix1Index >= 0 && row.model.cells[nameAffix1Index] ? row.model.cells[nameAffix1Index].value?.toString().trim() : null,
                            nameAffix2: nameAffix2Index >= 0 && row.model.cells[nameAffix2Index] ? row.model.cells[nameAffix2Index].value?.toString().trim() : null,
                            VATId: VATIdIndex >= 0 && row.model.cells[VATIdIndex] ? row.model.cells[VATIdIndex].value?.toString().trim() : null,
                            taxNumber: taxNumberIndex >= 0 && row.model.cells[taxNumberIndex] ? row.model.cells[taxNumberIndex].value?.toString().trim() : null,
                            street: streetIndex >= 0 && row.model.cells[streetIndex] ? row.model.cells[streetIndex].value?.toString().trim() : null,
                            postCode: postCodeIndex >= 0 && row.model.cells[postCodeIndex] ? row.model.cells[postCodeIndex].value?.toString().trim() : null,
                            city: cityIndex >= 0 && row.model.cells[cityIndex] ? row.model.cells[cityIndex].value?.toString().trim() : null,
                            country: countryIndex >= 0 && row.model.cells[countryIndex] ? row.model.cells[countryIndex].value?.toString().trim() : null,
                            contactPerson: contactPersonIndex >= 0 && row.model.cells[contactPersonIndex] ? row.model.cells[contactPersonIndex].value?.toString().trim() : null,
                            phone: phoneIndex >= 0 && row.model.cells[phoneIndex] ? row.model.cells[phoneIndex].value?.toString().trim() : null,
                            email: emailIndex >= 0 && row.model.cells[emailIndex] ? row.model.cells[emailIndex].value?.toString().trim() : null,
                            bankName1: bankName1Index >= 0 && row.model.cells[bankName1Index] ? row.model.cells[bankName1Index].value?.toString().trim() : null,
                            bankSortCode1: bankSortCode1Index >= 0 && row.model.cells[bankSortCode1Index] ? row.model.cells[bankSortCode1Index].value?.toString().trim() : null,
                            bankAccountNo1: bankAccountNo1Index >= 0 && row.model.cells[bankAccountNo1Index] ? row.model.cells[bankAccountNo1Index].value?.toString().trim() : null,
                            countryCode1: countryCode1Index >= 0 && row.model.cells[countryCode1Index] ? row.model.cells[countryCode1Index].value?.toString().trim() : null,
                            iBAN_No1: iBAN_No1Index >= 0 && row.model.cells[iBAN_No1Index] ? row.model.cells[iBAN_No1Index].value?.toString().trim() : null,
                            swift_code1: swift_code1Index >= 0 && row.model.cells[swift_code1Index] ? row.model.cells[swift_code1Index].value?.toString().trim() : null,
                            differentAccountHolder1: differentAccountHolder1Index >= 0 && row.model.cells[differentAccountHolder1Index] ? row.model.cells[differentAccountHolder1Index].value?.toString().trim() : null,
                            bankSortCode2: bankSortCode2Index >= 0 && row.model.cells[bankSortCode2Index] ? row.model.cells[bankSortCode2Index].value?.toString().trim() : null,
                            bankName2: bankName2Index >= 0 && row.model.cells[bankName2Index] ? row.model.cells[bankName2Index].value?.toString().trim() : null,
                            bankAccountNo2: bankAccountNo2Index >= 0 && row.model.cells[bankAccountNo2Index] ? row.model.cells[bankAccountNo2Index].value?.toString().trim() : null,
                            countryCode2: countryCode2Index >= 0 && row.model.cells[countryCode2Index] ? row.model.cells[countryCode2Index].value?.toString().trim() : null,
                            iBAN_No2: iBAN_No2Index >= 0 && row.model.cells[iBAN_No2Index] ? row.model.cells[iBAN_No2Index].value?.toString().trim() : null,
                            swift_code2: swift_code2Index >= 0 && row.model.cells[swift_code2Index] ? row.model.cells[swift_code2Index].value?.toString().trim() : null,
                            differentAccountHolder2: differentAccountHolder2Index >= 0 && row.model.cells[differentAccountHolder2Index] ? row.model.cells[differentAccountHolder2Index].value?.toString().trim() : null,
                            bankName3: bankName3Index >= 0 && row.model.cells[bankName3Index] ? row.model.cells[bankName3Index].value?.toString().trim() : null,
                            bankAccountNo3: bankAccountNo3Index >= 0 && row.model.cells[bankAccountNo3Index] ? row.model.cells[bankAccountNo3Index].value?.toString().trim() : null,
                            countryCode3: countryCode3Index >= 0 && row.model.cells[countryCode3Index] ? row.model.cells[countryCode3Index].value?.toString().trim() : null,
                            iBAN_No3: iBAN_No3Index >= 0 && row.model.cells[iBAN_No3Index] ? row.model.cells[iBAN_No3Index].value?.toString().trim() : null,
                            swift_code3: swift_code3Index >= 0 && row.model.cells[swift_code3Index] ? row.model.cells[swift_code3Index].value?.toString().trim() : null,
                            differentAccountHolder3: differentAccountHolder3Index >= 0 && row.model.cells[differentAccountHolder3Index] ? row.model.cells[differentAccountHolder3Index].value?.toString().trim() : null,
                        });


                        // if array.length >= env.bulkSize
                        if (rowsToInsert.length >= env.bulkInsertSize) {
                            // then bulk insert and empty the array
                            await AccountModel
                                .getAccounts('accounts_' + managerId)
                                .bulkCreate(rowsToInsert, {
                                    transaction: t
                                });
                            bulkCount++;
                            const used = process.memoryUsage().heapUsed / 1024 / 1024;
                            console.log(`${new Date()}:The script uses approximately: ${Math.round(used * 100) / 100} MB`);
                            logger.info(`${new Date()}:The script uses approximately: ${Math.round(used * 100) / 100} MB`);

                            rowsToInsert = [];
                        } // end of bulk insert batch

                    }
                    index++;


                } // end of for each row
                // if the array not empty: bulk insert it then empty it.
                if (rowsToInsert.length > 0) {
                    await AccountModel
                        .getAccounts('accounts_' + managerId)
                        .bulkCreate(rowsToInsert, {
                            transaction: t
                        });
                    const used = process.memoryUsage().heapUsed / 1024 / 1024;
                    console.log(`${new Date()}:The script uses approximately: ${Math.round(used * 100) / 100} MB`);
                    logger.info(`${new Date()}:The script uses approximately: ${Math.round(used * 100) / 100} MB`);
                    rowsToInsert = [];
                } /// end of rest data condition if (rowsToInsert.length > 0)

                await t.commit();
                console.log(`${new Date()}:transaction commited successfully for file`);
                logger.info(`${new Date()}:transaction commited successfully for file`);

                benchmark = process.hrtime(benchmark);
                console.log('benchmark took %d seconds and %d nanoseconds', benchmark[0], benchmark[1]);
                logger.info(`${new Date()}:benchmark for import took: ${benchmark[0]} seconds and ${benchmark[1]} nanoseconds for ${index} records`);
                // }
                resolve(true);
            } // end of main for each sheet

        } catch (err) {
            console.log("ERROR, the transaction will Rollback");
            console.error(err);
            const splitedMsg = err.message.split(" at row ");
            if (splitedMsg.length > 1) {
                const rowNum = splitedMsg[1];
                const theRealRowNum = rowNum > 0 ? parseInt(rowNum) + 1 + (bulkCount * env.bulkInsertSize) : index;
                const errorMsg = splitedMsg[0] + ' at row ' + theRealRowNum;
                logger.error(`${new Date()}: ${splitedMsg[0]} at row ${theRealRowNum}`);
                console.log("ERROR on row number: " + theRealRowNum);
                reject(new Exception(httpStatus.BAD_REQUEST, errorMsg, true));
            } else {
                console.log("ERROR on row number: " + index);
                reject(new Exception(httpStatus.BAD_REQUEST, err.message, true));
            }
            // logger.error(`${new Date()}: ${err}`);
            errorHandler("Error", err);
        }
    });


};

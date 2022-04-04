
const { DataTypes } = require("sequelize");
const sequelize = require('../config/sequelize.config');

const sequelizer = sequelize.getSequelize();

const Procedures = sequelizer.define('Procedures', {
    id: {
        type: DataTypes.BIGINT(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
    },
    procedureDate: {
        type: DataTypes.DATE
    },
    data: {
        type: DataTypes.BOOLEAN
    },
    analysis: {
        type: DataTypes.BOOLEAN
    },
    dataSource: {
        type: DataTypes.STRING(50)
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.ENUM("NOT_IMPORTED", "IMPORTED", "PARTIAL_CALCULATED", "CALCULATED", "DELETED"),
        defaultValue: 'NOT_IMPORTED'
    },
    text_word: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    text_account: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    amount: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    credit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    payment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    docType: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    due_date: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    liquidity: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    emailWord: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    emailSender: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    linkTrans: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
}, {
    tableName: 'Procedures'
});


module.exports.getProcedures = function () {
    return Procedures;
};


module.exports.syncProcedures = async function () {
    await this.getProcedures().sync({
        alter: true
    });
};
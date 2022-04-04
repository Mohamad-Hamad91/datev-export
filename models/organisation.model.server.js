const {
    DataTypes
} = require('sequelize');
const sequelize = require('../config/sequelize.config');
const Procedure = require('./procedures.model.server').getProcedures();

const sequelizer = sequelize.getSequelize();



const Organisation = sequelizer.define('Organisation', {
    id: {
        type: DataTypes.BIGINT(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
    },
    logo: {
        type: DataTypes.STRING(250),
    },
    email: {
        type: DataTypes.STRING(50),
    },
    country: {
        type: DataTypes.STRING(25),
    },
    city: {
        type: DataTypes.STRING(25),
    },
    postCode: {
        type: DataTypes.STRING(25),
    },
    street: {
        type: DataTypes.STRING(50),
    },
    houseNr: {
        type: DataTypes.INTEGER,
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'organisation'
});


Organisation.hasMany(Procedure);
Procedure.belongsTo(Organisation);


module.exports.getOrganisation = function () {
    return Organisation;
};


module.exports.syncOrganisation = async function () {
    await this.getOrganisation().sync({
        alter: true
    });
};
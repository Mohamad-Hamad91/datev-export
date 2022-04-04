const {
    DataTypes
} = require('sequelize');
const sequelize = require('../config/sequelize.config');
const Organisation = require('./organisation.model.server').getOrganisation();

const sequelizer = sequelize.getSequelize();


const User = sequelizer.define('User', {
    id: {
        type: DataTypes.BIGINT(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    firstname: {
        type: DataTypes.STRING(25),
    },
    lastname: {
        type: DataTypes.STRING(25),
    },
    email: {
        type: DataTypes.STRING(50),
        unique: true
    },
    title: {
        type: DataTypes.STRING(10),
    },
    mobileNumber: {
        type: DataTypes.STRING(25),
    },
    username: {
        type: DataTypes.STRING(25),
    },
    password: {
        type: DataTypes.STRING(60),
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
    housenumber: {
        type: DataTypes.INTEGER,
    },
    // contactPerson: {
    //     type: DataTypes.STRING(50),
    // },
    note: {
        type: DataTypes.STRING(50),
    },
    expireDate: {
        type: DataTypes.DATE
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    reseted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    country: {
        type: DataTypes.STRING(25),
    }
}, {
    tableName: 'users'
});

Organisation.hasMany(User);
User.belongsTo(Organisation);

module.exports.getUser = function () {
    return User;
};


module.exports.syncUser = async function () {
    await this.getUser().sync({
        alter: true
    });
};
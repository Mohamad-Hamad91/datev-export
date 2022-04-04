const {
    DataTypes
} = require('sequelize');
const sequelize = require('../config/sequelize.config');
const User = require('./user.model.server').getUser();
const sequelizer = sequelize.getSequelize();


const Role = sequelizer.define('Role', {
    id: {
        type: DataTypes.BIGINT(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(25),
    },
    role_description: {
        type: DataTypes.STRING(150)
    }
}, {
    tableName: 'roles'
});


Role.hasMany(User);
User.belongsTo(Role);

module.exports.getRole = function () {
    return Role;
};

module.exports.syncRole = async function () {
    await this.getRole().sync({
        alter: true
    });
};
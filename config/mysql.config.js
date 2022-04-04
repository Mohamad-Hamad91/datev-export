const env = require('./environment');
const mysql = require('mysql2');


// const pool = mysql.createPool({
//     host: env.host,
//     user: env.databaseUsername,
//     password: env.databasePassword,
//     database: env.databaseName,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
//   });

module.exports.getConnection = (options) => {
    return mysql.createConnection({
        host: env.host,
        user: env.databaseUsername,
        password: env.databasePassword,
        database: env.databaseName,
        // multipleStatements: true,
        ...options
    });
};
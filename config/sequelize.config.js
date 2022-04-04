const { Sequelize } = require("sequelize");
const env = require("./environment");

const sequelize = new Sequelize(
  env.databaseName,
  env.databaseUsername,
  env.databasePassword,
  {
    host: env.databaseHost,
    port: 3306,
    dialect: env.databaseDialect,
    logging: false,
    dialectOptions: {
        connectTimeout: 60000,
      options: {
        requestTimeout: 60000,
      },
    },
    pool: {
      max: 5,
      min: 1,
      idle: 10000,
      evict: 10000,
      acquire: 90000,
    },
  }
);

module.exports.testDBConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports.getSequelize = () => {
  return new Sequelize(
    env.databaseName,
    env.databaseUsername,
    env.databasePassword,
    {
      host: env.databaseHost,
      dialect: env.databaseDialect,
      logging: false,
      pool: {
        max: 5,
        min: 1,
        idle: 10000,
        evict: 10000,
      },
    }
  );
};

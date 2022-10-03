// import "dotenv/config";
// import Sequelize from "sequelize";
// import path from "path";
// var __dirname = path.resolve();

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
//   host: process.env.DB_HOST,
//   dialect: process.env.DB_DIALECT,
//   timezone: "+07:00",
//   operatorsAliases: 0,
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 60000,
//     idle: 10000,
//   },
//   logging: false,
// });
// const db = {};

// db.Sequelize = Sequelize;
// db.sequelize = sequelize;

// db.device = sequelize.import(path.join(__dirname, "models/model.device.cjs"));
// db.message = sequelize.import(path.join(__dirname, "models/model.message.cjs"));
// db.message_status = sequelize.import(path.join(__dirname, "models/model.message_status.cjs"));
// export default db;

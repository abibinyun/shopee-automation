const { Sequelize } = require("sequelize");
const config = require("./config.js");

const dbConfig = config.development;

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  pool: {
    max: 50, // Tingkatkan jumlah maksimum koneksi
    min: 10, // Tingkatkan jumlah minimum koneksi
    acquire: 60000, // Waktu tunggu maksimum sebelum request gagal (dinaikkan)
    idle: 20000, // Waktu idle lebih lama sebelum koneksi ditutup
  },
  dialectOptions: {
    connectTimeout: 90000, // Perpanjang timeout koneksi ke database
  },
  logging: false,
});

module.exports = sequelize;

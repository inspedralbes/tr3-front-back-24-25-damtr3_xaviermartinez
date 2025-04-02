const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  "a21xavmarvel_boomberman",
  "a21xavmarvel_a21xavmarvel",
  "XavierMateu1290",
  {
    host: 'dam.inspedralbes.cat',
    dialect: 'mysql',
    port: 3306,
  }
);

// Exportar solo la conexión
module.exports = sequelize;
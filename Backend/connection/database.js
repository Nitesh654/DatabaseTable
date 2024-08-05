const Sequelize = require('sequelize');

const sequelize = new Sequelize('datatable', 'root', 'rooot', {
    dialect: 'mysql',
    host: 'localhost',
});

module.exports = sequelize;

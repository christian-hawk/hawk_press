const Sequelize = require("sequelize")
const connection = new Sequelize("hawk_press","root","password",{
    host: 'localhost',
    dialect: 'mysql',
    timezone: "-03:00"
})

module.exports = connection
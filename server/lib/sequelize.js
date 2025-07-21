import { Sequelize } from 'sequelize';

const sequelize2 = new Sequelize("mysql://root@localhost:3306/db_sequelize", {
  dialect: "mysql",
});
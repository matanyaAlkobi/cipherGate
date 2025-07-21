import { DataTypes, Sequelize } from "sequelize";
import 'dotenv/config'
const sequelize2 = new Sequelize(process.env.SEQUELIZE_CONNECTION, {
  dialect: "mysql",
});

const User = sequelize2.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: { type: DataTypes.STRING, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: "users" }
);

await sequelize2.sync({force:false});

export default User;

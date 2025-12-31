import dotenv from "dotenv";
dotenv.config();
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  String(process.env.DB_NAME),
  String(process.env.DB_USER),
  String(process.env.DB_PASSWORD), // <-- force string
  {
    host: String(process.env.DB_HOST),
    dialect: "postgres",
    logging: false
  }
);


export default sequelize;

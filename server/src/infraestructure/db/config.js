import dotenv from 'dotenv';
import path from 'path';

console.log("Current working directory:", process.cwd());
dotenv.config();


export default {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    migrationStorage: "json",
    migrationStoragePath: path.join(process.cwd(), "src", "infraestructure", "db", "migrations.json"),
    seederStorage: "json",
    seederStoragePath: path.join(process.cwd(), "src", "infraestructure", "db", "seeders.json"),
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
};

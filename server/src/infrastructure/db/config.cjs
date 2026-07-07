// src/infrastructure/db/config.cjs
// CJS bridge for sequelize-cli; uses the same .env as the ESM config module.
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    migrationStorage: "json",
    migrationStoragePath: path.join(process.cwd(), "src", "infrastructure", "db", "migrations.json"),
    seederStorage: "json",
    seederStoragePath: path.join(process.cwd(), "src", "infrastructure", "db", "seeders.json"),
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
  },
};

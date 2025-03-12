// src/infraestructure/db/config.cjs
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();
console.log("Current working directory:", process.cwd());

module.exports = async () => {
  // Dynamically import the ES module
  const envConfigModule = await import('../../envConfig.js');
  const envConfig = envConfigModule.default;
  
  console.log("DB_USER:", envConfig.DB_USER);
  
  return {
    development: {
      username: envConfig.DB_USER,
      password: envConfig.DB_PASS,
      database: envConfig.DB_NAME,
      host: envConfig.DB_HOST,
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
};
 npx sequelize-cli db:migrate --config src/infraestructure/db/config.js --migrations-path src/infraestructure/db 

npx sequelize-cli seed:generate --name demo-student


npx sequelize-cli db:seed:all --config src/infraestructure/db/config.js --seeders-path src/infraestructure/db/seeders


revertir 

npx sequelize-cli db:seed:undo:all --config src/infraestructure/db/config.js --seeders-path src/infraestructure/db/seeders

npx sequelize-cli model:generate --name Notification --attributes title:string,message:string,isAttended:boolean,emmittedAt:date attendedAt:date --models-path src/infraestructure/db/models --migrations-path src/infraestructure/db/migrations


npx sequelize-cli db:migrate --config src/infraestructure/db/config.cjs --migrations-path src/infraestructure/db/migrations

npx sequelize-cli seed:generate --name demo-student --seeders-path src/infraestructure/db/seeders


npx sequelize-cli db:seed:all --config src/infraestructure/db/config.cjs --seeders-path src/infraestructure/db/seeders


revertir 

npx sequelize-cli db:seed:undo:all --config src/infraestructure/db/config.cjs --seeders-path src/infraestructure/db/seeders

npx sequelize-cli migration:generate --name modifying-notification-model --migrations-path src/infraestructure/db/migrations
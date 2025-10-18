# Servidor de Dapp Universitaria

### Versión de Node.js
- **Node.js 18.20.4** (requerida específicamente para compatibilidad)
- Se recomienda usar NVM (Node Version Manager) para gestionar versiones
-Llenar variables de entorno

### Dependencias Principales
- React 18
- Ethers.js
- Tailwind CSS
- React Router DOM

## Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
### 2. Levantar proyecto
```bash
npm start
```
## Comandos de Sequalize
### Creacion de modelo
npx sequelize-cli model:generate --name ModelName --attributes nameAttribute:dataType,nameAttribute:dataType --models-path src/infraestructure/db/models --migrations-path src/infraestructure/db/migrations
### Migracion
npx sequelize-cli db:migrate --config src/infraestructure/db/config.cjs --migrations-path src/infraestructure/db/migrations
### Generar seed
npx sequelize-cli seed:generate --name demo-student --seeders-path src/infraestructure/db/seeders
### Migrar todos los seed
npx sequelize-cli db:seed:all --config src/infraestructure/db/config.cjs --seeders-path src/infraestructure/db/seeders
### Revertir cambios
npx sequelize-cli db:seed:undo:all --config src/infraestructure/db/config.cjs --seeders-path src/infraestructure/db/seeders
### Generar migraciones
npx sequelize-cli migration:generate --name modifying-notification-model --migrations-path src/infraestructure/db/migrations

***Advertencia: Error "filter not found"**

>Si durante la ejecución aparece un error similar a:
> ```
> Error: could not coalesce error (error={ "code": -32000, "message": "filter not found" })
> ```
> Este problema ocurre cuando el nodo blockchain (Hardhat, Ganache o Alchemy) elimina un filtro antiguo usado por Ethers.js.
>
> **Soluciones recomendadas:**
> - Reiniciar el servidor (`Ctrl + C` y luego `npm start`)
> - Asegurarse de limpiar los listeners antiguos con:
>   ```js
>   provider.removeAllListeners();
>   contract.removeAllListeners();
>   ```
> - Si el problema persiste, usar `queryFilter()` para obtener eventos históricos en lugar de suscripciones activas.

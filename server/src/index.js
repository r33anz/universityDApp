import config from "./infrastructure/config/env.js";
import { app, io } from "./app.js";
import ipfsConnection from "./infrastructure/ipfs/ipfsConnection.js";
import sequelize from "./infrastructure/db/dbConnection.js";

sequelize.sync({ force: false })
    .then(() => console.log('Base de datos sincronizada'))
    .catch(err => console.error('Error al sincronizar BD:', err));

app.listen(config.http.port, async () => {
    console.log(`Server running on port ${config.http.port}`);
    try {
        await ipfsConnection.initialize();
        console.log("IPFS inicializado");
    } catch (error) {
        console.error("Error ", error);
        process.exit(1);
    }
});

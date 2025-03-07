import dotenv from "dotenv";
import app from "./app.js";
import initiaizeWeb3Storage from "./infraestructure/ipfs/ipfsConnection.js";
import sequelize from "./infraestructure/db/dbConnection.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false })  
    .then(() => console.log('Base de datos sincronizada'))
    .catch(err => console.error('Error al sincronizar BD:', err));


app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await initiaizeWeb3Storage();
        console.log("Web3.storage inicializado");
    } catch (error) {
        console.error("Error inicializando web3.storage:", error)       
        process.exit(1);
    }
});
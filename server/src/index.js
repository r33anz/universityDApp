import dotenv from "dotenv";
import {app,io} from "./app.js";
import ipfsConnection from "./infraestructure/ipfs/ipfsConnection.js";
import sequelize from "./infraestructure/db/dbConnection.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false })  
    .then(() => console.log('Base de datos sincronizada'))
    .catch(err => console.error('Error al sincronizar BD:', err));


app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await ipfsConnection.initialize();
        console.log("IPFS inicializado");

        io.emit("server_ready", { message: "Servidor listo", time: new Date() });
    
    } catch (error) {
        console.error("Error ", error)       
        process.exit(1);
    }
});
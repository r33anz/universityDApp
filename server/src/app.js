import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { create } from "@web3-storage/w3up-client";
import { ethers } from "ethers";

dotenv.config();

const app = express();
app.use(cors());    
app.use(express.json());

const PORT = process.env.PORT || 5000;

let client;
let space;

async function initiaizeWeb3Storage(){
    try {
        client = await create();
        space = await client.createSpace("preExperimento");
        console.log("Space created:", space.did());
    
        const myAccount = await client.login("rodrigo33newton@gmail.com");
        console.log("Inicio de sesión exitoso.");
    
        while (true) {
          const res = await myAccount.plan.get();
          if (res.ok) break;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    
        await myAccount.provision(space.did());
        await space.save();
        await client.setCurrentSpace(space.did());
    
        console.log("Espacio creado y configurado.");
      } catch (error) {
        console.error("Error inicializando web3.storage:", error);
        throw error;
      }
}

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
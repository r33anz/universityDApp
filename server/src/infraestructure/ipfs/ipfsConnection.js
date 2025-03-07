import { create } from "@web3-storage/w3up-client";

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

export default initiaizeWeb3Storage;
import { create } from "@web3-storage/w3up-client";

class IPFSConnection {
  constructor() {
    this.client = null;
    this.space = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      this.client = await create();
      this.space = await this.client.createSpace("preExperimento");
      
      const myAccount = await this.client.login("rodrigo33newton@gmail.com");
      
      while (true) {
        const res = await myAccount.plan.get();
        if (res.ok) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await myAccount.provision(this.space.did());
      await this.space.save();
      await this.client.setCurrentSpace(this.space.did());
      
      this.initialized = true;
      console.log("Web3.Storage configurado correctamente");
    } catch (error) {
      console.error("Error inicializando Web3.Storage:", error);
      throw error;
    }
  }

  async uploadFile(file) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const cid = await this.client.uploadFile(file);
      return cid.toString();
    } catch (error) {
      console.error("Error subiendo archivo:", error);
      throw error;
    }
  }
}

export default new IPFSConnection();
import { create } from 'ipfs-http-client';
import config from '../config/env.js';

class IPFSConnection {
  constructor() {
    this.client = null;
  }

  async initialize() {
    if (this.client) return;

    try {
      this.client = create({
        url: config.ipfs.apiUrl || 'http://127.0.0.1:5001'
      });

      const version = await this.client.version();
      console.log("IPFS HTTP Client conectado:", version.version);
    } catch (error) {
      console.error("Error al conectar IPFS HTTP:", error.message);
      throw error;
    }
  }

  async uploadFile(file) {
    try {
      const { cid } = await this.client.add(file);
      return cid.toString();
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      throw error;
    }
  }
}

export default new IPFSConnection();

import { create } from 'ipfs-http-client';
import envConfig from '../../envConfig.js';

class IPFSConnection {
  constructor() {
    this.client = null;
  }

  async initialize() {
    if (this.client) return;

    try {
      this.client = create({
        url: envConfig.IPFS_API || 'http://127.0.0.1:5001'
      });

      const version = await this.client.version();
      console.log("✅ IPFS HTTP Client conectado:", version.version);
    } catch (error) {
      console.error("❌ Error al conectar IPFS HTTP:", error.message);
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

  async addToMfs(cid, path) {
    try {
      await this.client.files.cp(`/ipfs/${cid}`, path, { parents: true });
      console.log(`📁 Archivo añadido a MFS: ${path}`);
    } catch (error) {
      console.error('Error en MFS:', error);
      throw error;
    }
  }

  async getMfsDirectoryCid(path) {
    try {
      const stats = await this.client.files.stat(path);
      return stats.cid.toString();
    } catch (error) {
      console.error('Error obteniendo CID de directorio:', error);
      throw error;
    }
  }
}

export default new IPFSConnection();

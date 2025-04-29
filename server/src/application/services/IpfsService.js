import ipfsConnection from "../../infraestructure/ipfs/ipfsConnection.js";
import { Blob } from 'buffer';

class IPFSService{
    async uploadMultiplePdfs(pdfs) {
        try {
            if (!ipfsConnection.client) {
                throw new Error('La conexión IPFS no está inicializada');
            }
            
            const results = [];
            const basePath = `/${pdfs[0].path.split('/')[1]}`; 

            await this.createDirectoryStructure(pdfs);
            
            for (const pdf of pdfs) {
                if (!pdf.path || !pdf.blob) {
                    throw new Error('Cada archivo debe tener path y blob');
                }

                const { cid } = await ipfsConnection.client.add(pdf.blob);
                const fullPath = `${pdf.path}${pdf.filename}`;
                await ipfsConnection.client.files.cp(`/ipfs/${cid}`, fullPath);

                results.push({
                    filename: pdf.filename,
                    path: fullPath,
                    cid: cid.toString()
                });
            }

            const rootStats = await ipfsConnection.client.files.stat(basePath);
            const rootCid = rootStats.cid.toString();

            return {
                success: true,
                dirCid: rootCid,
                ipfsLink: `http://localhost:8080/ipfs/${rootCid}`
            };
          }  catch (error) {
                console.error('Error en IPFSService', error);
                //throw new Error(`Error en IPFSService: ${error.message}`);
        }
      }

      async createDirectoryStructure(pdfs) {
        const createdPaths = new Set();
        
        for (const pdf of pdfs) {
            const pathParts = pdf.path.split('/').filter(Boolean);
            let currentPath = '';
            
            for (const part of pathParts) {
                currentPath += `/${part}`;
                if (!createdPaths.has(currentPath)) {
                    try {
                        await ipfsConnection.client.files.mkdir(currentPath, { parents: true });
                        createdPaths.add(currentPath);
                    } catch (error) {
                        if (!error.message.includes('already exists')) {
                            throw error;
                        }
                    }
                }
            }
        }
    }
    
    async safeCopyToMfs(cid, fullPath) {
        try {
            await ipfsConnection.client.files.cp(`/ipfs/${cid}`, fullPath);
            console.log(`Archivo copiado a MFS: ${fullPath}`);
        } catch (error) {
            console.error(`Error copiando ${fullPath}:`, error.message);
            //throw new Error(`No se pudo copiar a MFS: ${fullPath}`);
        }
    }
}

export default new IPFSService();
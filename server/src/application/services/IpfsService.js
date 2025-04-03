import ipfsConnection from "../../infraestructure/ipfs/ipfsConnection.js";
import { Blob } from 'buffer';

class IPFSService{

    async uploadFile(pdfBuffer,filename){
        try {
            const blob = new Blob([pdfBuffer], {
                type: 'application/pdf'
            });
            const cid = await ipfsConnection.uploadFile(blob);
                        
            return {
              success: true,
              cid
            };
          } catch (error) {
            console.error('Error en IpfsService:', error);
            throw error;
          }
    }
}

export default new IPFSService();
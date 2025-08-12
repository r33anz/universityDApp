import ipfsConnection from "../../infraestructure/ipfs/ipfsConnection.js";
import { Blob } from 'buffer';
import KardexError from "../../interface/error/kardexErrors.js";

class IPFSService{
    async uploadMultiplePdfs(pdfs) {
        try {
            if (!ipfsConnection.client) {
                throw KardexError.internal(
                    "La conexión IPFS no está inicializada",
                    null,
                    "IPFS_CONNECTION_ERROR"
                );
            }
            
            if (!pdfs || pdfs.length === 0) {
                throw KardexError.badRequest(
                    "No se proporcionaron archivos para subir",
                    null,
                    "NO_FILES_PROVIDED"
                );
            }

            const results = [];
            const basePath = `/${pdfs[0].path.split('/')[1]}`; 

            await this.createDirectoryStructure(pdfs);
            
            for (const pdf of pdfs) {
                if (!pdf.path || !pdf.blob) {
                    throw KardexError.badRequest(
                        "Cada archivo debe tener path y blob definidos",
                        { filename: pdf.filename },
                        "INVALID_FILE_DATA"
                    );
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
        }catch (error) {
                console.error('Error en IPFSService', error);
                
                if (error instanceof KardexError) {
                    throw error;
                }
                
                throw KardexError.internal(
                    "Error al subir archivos a IPFS",
                    {
                        errorDetails: error.message,
                        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
                    },
                    "IPFS_UPLOAD_ERROR"
                );
        }
    }

      async createDirectoryStructure(pdfs) {
        const createdPaths = new Set();
        
        try {
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
                                throw KardexError.internal(
                                    "Error al crear estructura de directorios en IPFS",
                                    {
                                        path: currentPath,
                                        errorDetails: error.message
                                    },
                                    "IPFS_DIRECTORY_ERROR"
                                );
                            }
                        }
                    }
                }
            }
        } catch (error) {
            if (error instanceof KardexError) {
                throw error;
            }
            throw KardexError.internal(
                "Error inesperado al crear directorios",
                { errorDetails: error.message },
                "DIRECTORY_STRUCTURE_ERROR"
            );
        }
    }
    
    async safeCopyToMfs(cid, fullPath) {
        try {
            await ipfsConnection.client.files.cp(`/ipfs/${cid}`, fullPath);
        } catch (error) {
            console.error(`Error copiando ${fullPath}:`, error.message);
            
            throw KardexError.internal(
                `No se pudo copiar el archivo a MFS: ${fullPath}`,
                {
                    cid,
                    fullPath,
                    errorDetails: error.message
                },
                "IPFS_COPY_ERROR"
            );
        }
    }
}

export default new IPFSService();
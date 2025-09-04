import ipfsConnection from "../../infraestructure/ipfs/ipfsConnection.js";
import { Blob } from 'buffer';
import KardexError from "../../interface/error/kardexErrors.js";
import envConfig from "../../envConfig.js";

class IPFSService{
    async uploadMultiplePdfs(pdfs, overwrite = false) {
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
            const basePath = `/${pdfs[0].path.split("/")[1]}`; 
            await this.createDirectoryStructure(pdfs);

            for (const pdf of pdfs) {
                if (!pdf.path || !pdf.blob || !pdf.filename) {
                    throw KardexError.badRequest(
                        "Cada archivo debe tener path, blob y filename definidos",
                        { filename: pdf.filename },
                        "INVALID_FILE_DATA"
                    );
                }

                const filename = overwrite
                    ? pdf.filename
                    : `${pdf.filename.replace(".pdf", "")}_${Date.now()}.pdf`;
                const fullPath = `${pdf.path}${filename}`;

                const { cid } = await ipfsConnection.client.add(pdf.blob, {
                    cidVersion: 1, 
                });
                
                if (!overwrite) {
                    try {
                        await ipfsConnection.client.files.stat(fullPath);
                        throw KardexError.fileExists(
                            `El archivo ya existe en IPFS: ${fullPath}`,
                            { path: fullPath },
                            "FILE_ALREADY_EXISTS"
                        );
                    } catch (error) {
                        if (!error.message.includes("file does not exist")) {
                            console.error(`[IPFSService] Error checking file existence: ${error.message}`);
                            throw error;
                        }
                    }
                } else {
                    try {
                        await ipfsConnection.client.files.rm(fullPath, { recursive: true });
                    } catch (error) {
                        if (!error.message.includes("file does not exist")) {
                            console.error(`[IPFSService] Error removing existing file: ${error.message}`);
                            throw KardexError.ipfsRemoveError(
                                `Error al eliminar archivo existente en IPFS: ${fullPath}`,
                                { path: fullPath, errorDetails: error.message },
                                "IPFS_REMOVE_ERROR"
                            );
                        }
                    }
                }

                try {
                    await ipfsConnection.client.files.cp(`/ipfs/${cid}`, fullPath, {
                        overwrite: true, 
                        cidVersion: 1, 
                    });
                } catch (error) {
                    console.error(`[IPFSService] Error copying file to MFS: ${error.message}`);
                    throw KardexError.internal(
                        `No se pudo copiar el archivo a MFS: ${fullPath}`,
                        { cid: cid.toString(), fullPath, errorDetails: error.message },
                        "IPFS_COPY_ERROR"
                    );
                }

                results.push({
                    filename,
                    path: fullPath,
                    cid: cid.toString(),
                });
            }

            const rootStats = await ipfsConnection.client.files.stat(basePath);
            const rootCid = rootStats.cid.toString();

            return {
                success: true,
                dirCid: rootCid,
                ipfsLink: `${envConfig.IPFS_GATEWAY}${rootCid}`,
                files: results,
            };
        } catch (error) {
            console.error(`[IPFSService] Error in uploadMultiplePdfs: ${error.message}`);
            if (error instanceof KardexError) {
                throw error;
            }
            throw KardexError.internal(
                "Error al subir archivos a IPFS",
                {
                    errorDetails: error.message,
                    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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

    async metadataJSON(metadata) {
        try {
            if (!ipfsConnection.client) {
                throw KardexError.internal(
                    "La conexión IPFS no está inicializada",
                    null,
                    "IPFS_CONNECTION_ERROR"
                );
            }

            const jsonBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
            const cid  = await ipfsConnection.uploadFile(jsonBlob);

            return cid;
        } catch (error) {
            console.error('Error al subir metadata JSON a IPFS:', error);
            throw KardexError.internal(
                "Error al subir metadata JSON a IPFS",
                { errorDetails: error.message },
                "IPFS_METADATA_ERROR"
            );
        }
    }
}

export default new IPFSService();
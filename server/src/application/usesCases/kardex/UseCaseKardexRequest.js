import NotificationService from "../../services/NotificationService.js";
import IpfsService from "../../services/IpfsService.js";
import MergeFileService from "../../services/MergeFileService.js";
import KardexError from "../../../interface/error/kardexErrors.js";
import ContractError from "../../../interface/error/contractErrors.js";
import NFTService from "../../services/NFTService.js";

class UseCaseKardexRequest{

    async listeningResquest(codSIS,timeRequested){

        const notification = {
            title:"Nueva peticion de kardex",
            body:`El estudiante con codigo ${codSIS} solicito la subida de su kardex.`,
            emittedAt:timeRequested,
            from:codSIS
        }

        await NotificationService.saveNotification(notification)
        const newDataNotification = await NotificationService.lastNotificacion()
        NotificationService.sendNotificationToClientSide(newDataNotification)
    }

    async uploadingKardexToIPFS(pdfList) {
        try {
            if (!Array.isArray(pdfList) || pdfList.length === 0) {
                throw KardexError.fileUploadRequired({
                    details: "La lista de PDFs está vacía"
                });
            }

            const mergefiles = await MergeFileService.processFiles(pdfList);
            const ipfsResult = await IpfsService.uploadMultiplePdfs(
                mergefiles.map(f => ({
                  blob: f.blob,
                  filename: f.mergedFilename,
                  path: f.path
                }))
            );
              
            const sisCode = pdfList[0].sisCode;
            const mfsCID = ipfsResult.dirCid;
            try {
                const { success, tokenURI } = await NFTService.manageNFT(sisCode, mfsCID);

                if (!success) {
                    throw KardexError.kardexProcessingError({
                        details: "No se pudo procesar el NFT"
                    });
                }

                console.log(`NFT creado exitosamente para el estudiante: ${sisCode} con URI ${tokenURI}`);
                return {
                    success: true
                };
            } catch (error) {
                if (error.isContractError) {
                    throw KardexError.contractError(
                        `Error en el contrato inteligente: ${error.message}`,
                        error.details,
                        error.errorCode
                    );
                }
                throw error;
            }

        } catch (error) {
            console.error('Error al subir PDF en el caso de uso:', error);
            
            if (error instanceof KardexError || error instanceof ContractError) {
                throw error; 
            }
            
            throw KardexError.kardexProcessingError({
                originalError: error.message,
                stack: process.env.NODE_ENV === "development" ? error.stack : undefined
            });
        }
    }
}

export default new UseCaseKardexRequest();
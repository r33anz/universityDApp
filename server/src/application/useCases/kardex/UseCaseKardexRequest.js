import NotificationService from "../../services/NotificationService.js";
import IpfsService from "../../services/IpfsService.js";
import MergeFileService from "../../services/MergeFileService.js";
import KardexError from "../../../interface/error/kardexErrors.js";
import ContractError from "../../../interface/error/contractErrors.js";
import CredentialManagement from "../../../infrastructure/blockchain/contracts/CredentialManagementContract.js";
import NFTService from "../../services/NFTService.js";
class UseCaseKardexRequest{

    async listeningRequest(codSIS,timeRequested){

        const notification = {
            title:"Nueva peticion de kardex",
            body:`El estudiante con codigo ${codSIS} solicito la subida de su kardex.`,
            emittedAt:timeRequested,
            from:codSIS
        }

        await NotificationService.saveNotification(notification)
        const newDataNotification = await NotificationService.lastNotification()
        NotificationService.sendNotificationToClientSide(newDataNotification)
    }

    async uploadingKardexToIPFS(pdfList) {
        try {
            if (!Array.isArray(pdfList) || pdfList.length === 0) {
                throw KardexError.fileUploadRequired({
                details: "La lista de PDFs está vacía",
                });
            }

            const sisCode = pdfList[0].sisCode;
            const address = await CredentialManagement.getAddress(sisCode);
            const hasExistingKardex = await NFTService.hasKardex(address);
            const mergefiles = await MergeFileService.processFiles(pdfList);

            const ipfsResult = await IpfsService.uploadMultiplePdfs(
                mergefiles.map((f) => ({
                blob: f.blob,
                filename: f.mergedFilename,
                path: f.path,
                sisCode, 
                })),
                hasExistingKardex
            );

            const mfsCID = ipfsResult.dirCid;
            try {
                const { success } = await NFTService.manageNFT(sisCode, mfsCID);

                if (!success) {
                    throw KardexError.kardexProcessingError({
                        details: "No se pudo procesar el NFT",
                    });
                }
                NotificationService.updateNotificationToAttended(sisCode);
                const markKardexDelivered = await CredentialManagement.markKardexAsDelivered(sisCode);
                if (!markKardexDelivered) {
                    throw KardexError.kardexProcessingError({
                        details: "No se pudo marcar el kardex como entregado",
                    });
                }

                console.log(`NFT creado/actualizado exitosamente para el estudiante: ${sisCode}`);
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
                originalError: error.message
            });
        }
    }
}

export default new UseCaseKardexRequest();
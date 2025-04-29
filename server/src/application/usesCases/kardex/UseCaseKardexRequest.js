import NotificationService from "../../services/NotificationService.js";
import IpfsService from "../../services/IpfsService.js";
import CredentialManagement from "../../../infraestructure/blockchain/contracts/CredentialManagement.js";
import MergeFileService from "../../services/MergeFileService.js";

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
                throw new Error('Datos de PDF incompletos');
            }

            const sisCode = pdfList[0].sisCode;
            const mergefiles = await MergeFileService.processFiles(pdfList);
            const ipfsResult = await IpfsService.uploadMultiplePdfs(
                mergefiles.map(f => ({
                  blob: f.blob,
                  filename: f.mergedFilename,
                  path: f.path
                }))
              );

            //implementar contrato

            return {
                success: true,
                //files: ipfsResult.files,
                //dirCid: ipfsResult.dirCid,
                //link: `http://localhost:8080/ipfs/${ipfsResult.dirCid}`
            };
        } catch (error) {
            console.error('Error al subir PDF en el caso de uso:', error);
            //throw new Error(`Error al subir PDF: ${error.message}`);
        }
    }
}

export default new UseCaseKardexRequest();
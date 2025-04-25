import NotificationService from "../../services/NotificationService.js";
import IpfsService from "../../services/IpfsService.js";
import CredentialManagement from "../../../infraestructure/blockchain/contracts/CredentialManagement.js";


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

            // 1. Subir a IPFS Local (Kubo)
            const ipfsResult = await IpfsService.uploadMultiplePdfs(pdfList);
            const sisCode = pdfList[0].path.replace(/\//g, "");

            // 2. Generar enlaces locales
            const localLinks = {
                gateway: `http://localhost:8080/ipfs/${ipfsResult.dirCid}`,
                api: `http://localhost:5001/api/v0/cat?arg=${ipfsResult.dirCid}`,
                mfsPath: `/kardex/${sisCode}`
            };

            return {
                success: true,
                files: ipfsResult.files,
                dirCid: ipfsResult.dirCid,
                storageInfo: {
                    local: {
                        ipfsLink: localLinks.gateway,
                        mfsPath: localLinks.mfsPath
                    }
                }
            };
        } catch (error) {
            throw new Error(`Error al subir PDF: ${error.message}`);
        }
    }
}

export default new UseCaseKardexRequest();
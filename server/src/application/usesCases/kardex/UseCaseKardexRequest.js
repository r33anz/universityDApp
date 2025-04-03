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

    async uploadingKardexToIPFS(pdfData){
        try {
            const result = await IpfsService.uploadFile(
              pdfData.buffer,
              pdfData.filename
            );
            
            console.log(pdfData.sisCode)

            if(result.success){
                await CredentialManagement.setIPFSHash(pdfData.sisCode,result.cid)  
            }

            return {
                success:true
            };
          } catch (error) {
            throw new Error(`Error al subir PDF: ${error.message}`);
          }
    }
}

export default new UseCaseKardexRequest();
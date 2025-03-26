import NotificationService from "../../services/NotificationService.js";

class UseCaseKardexRequest{

    async listeningResquest(codSIS,timeRequested){

        const notification = {
            title:"Nueva peticion de kardex",
            body:`El estudiante con codigo ${codSIS} solicito la subida de su kardex.`,
            emmittedAt:timeRequested
        }
        
        await NotificationService.saveNotification(notification)
        const newDataNotification = await NotificationService.lastNotificacion()
        NotificationService.sendNotificationToClientSide(newDataNotification)
    }

}

export default new UseCaseKardexRequest();
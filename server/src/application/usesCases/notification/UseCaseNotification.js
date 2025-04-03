import EmailService from "../../services/EmailService.js";
import NotificationService from "../../services/NotificationService.js";

class UseCaseNotification{

    async revoverAllNotifications(){
        return await NotificationService.getAllNotifications();
    }

    async getPaginatedNotifications({ page, pageSize, statusFilter }){
        return await NotificationService.getPaginatedNotifications({ 
            page, pageSize, statusFilter 
        });
    }

    async attendNotifications(notificationIds){

        const recipientEmial = "rodrigo33newton@gmail.com";
        const sisCode = await NotificationService.recoverSisCodes(notificationIds);
        await EmailService.sendSisCodes(recipientEmial,sisCode);

        return await NotificationService.attendNotifications(notificationIds);
    }

}

export default new UseCaseNotification();
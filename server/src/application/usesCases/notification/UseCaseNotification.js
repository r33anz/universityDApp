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
        return await NotificationService.attendNotifications(notificationIds);
    }

}

export default new UseCaseNotification();
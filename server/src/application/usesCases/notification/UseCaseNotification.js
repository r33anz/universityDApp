import NotificationService from "../../services/NotificationService.js";

class UseCaseNotification{

    async revoverAllNotifications(){
        return await NotificationService.getAllNotifications();
    }
}

export default new UseCaseNotification();
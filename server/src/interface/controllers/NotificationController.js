import UseCaseNotification from "../../application/usesCases/notification/UseCaseNotification.js";

class NotificationController{

    async recoverAllNotifications(req,res){
        try {
            const notifications = await UseCaseNotification.revoverAllNotifications();

            if(notifications){
                res.status(200).json({ success: true, data: notifications });
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
}

export default new NotificationController();
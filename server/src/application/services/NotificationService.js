import notification from "../../infraestructure/db/models/notification.js"
import { io } from "../../app.js";
import dayjs from "dayjs";

class NotificationService{
    
    async saveNotification(notificationData){

        const {title,body,emmittedAt} = notificationData;
        try {
            const newNotification = await notification.create({
                title:title,
                message:body,
                emmittedAt:emmittedAt
            })

            return newNotification.toJSON()
        } catch (error) {
            console.error("Error creating notification in NotificationService:", error);
        }
    }

    sendNotificationToClientSide(notificationData){

        const {id,title,message,emmittedAt} = notificationData;
        const formattedDate = dayjs(emmittedAt).format("DD/MM/YYYY HH:mm:ss");
        
        io.emit("newNotification",{
            id,
            title,
            message,
            formattedDate
        });
    }

    async lastNotificacion(){
        const lastNotification = await notification.findOne({
            order: [["emmittedAt","DESC"]]
        });

        return lastNotification;
    }
}

export default new NotificationService();
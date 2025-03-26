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

        const {id,title,message,emmittedAt,isAttended} = notificationData;
        const formattedDate = dayjs(emmittedAt).format("DD/MM/YYYY HH:mm:ss");
        
        io.emit("newNotification",{
            id,
            title,
            message,
            formattedDate,
            isAttended
        });
    }

    async lastNotificacion(){
        const lastNotification = await notification.findOne({
            order: [["emmittedAt","DESC"]]
        });

        return lastNotification;
    }

    async getAllNotifications() {
        try {
            const notifications = await notification.findAll({
                order: [["emmittedAt", "DESC"]]
            });

        
            return notifications.map(n => ({
                id: n.id,
                title: n.title,
                message: n.message,
                isAttended: n.isAttended,
                emmittedAt: n.emmittedAt 
                    ? dayjs(n.emmittedAt).format("DD/MM/YYYY HH:mm:ss") 
                    : null,
                attendedAt: n.attendedAt 
                    ? dayjs(n.attendedAt).format("DD/MM/YYYY HH:mm:ss") 
                    : null
            }));

        } catch (error) {
            console.error("Error fetching notifications:", error);
            return [];
        }
    }
}

export default new NotificationService();
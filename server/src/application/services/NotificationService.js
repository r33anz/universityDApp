import notification from "../../infraestructure/db/models/notification.js"
import { io } from "../../app.js";
import dayjs from "dayjs";

class NotificationService{
    
    async saveNotification(notificationData){

        const {title,body,emittedAt,from} = notificationData;
        try {
            const newNotification = await notification.create({
                title:title,
                message:body,
                emittedAt:emittedAt,
                from:from
            })

            return newNotification.toJSON()
        } catch (error) {
            console.error("Error creating notification in NotificationService:", error);
        }
    }

    sendNotificationToClientSide(notificationData){

        const {id,title,message,emittedAt,status,from} = notificationData;
        const formattedDate = dayjs(emittedAt).format("DD/MM/YYYY HH:mm:ss");
        
        io.emit("newNotification",{
            id,
            title,
            message,
            formattedDate,
            status,
            from
        });
    }

    async lastNotificacion(){
        const lastNotification = await notification.findOne({
            order: [["emittedAt","DESC"]]
        });

        return lastNotification;
    }

    async getAllNotifications() {
        try {
            const notifications = await notification.findAll({
                order: [["emittedAt", "DESC"]]
            });

            return notifications.map(n => ({
                id: n.id,
                title: n.title,
                message: n.message,
                isAttended: n.isAttended,
                emittedAt: n.emittedAt 
                    ? dayjs(n.emittedAt).format("DD/MM/YYYY HH:mm:ss") 
                    : null,
                attendedAt: n.attendedAt 
                    ? dayjs(n.attendedAt).format("DD/MM/YYYY HH:mm:ss") 
                    : null,
                from:n.from
            }));

        } catch (error) {
            console.error("Error fetching notifications:", error);
            return [];
        }
    }

    async getPaginatedNotifications({ page = 1, pageSize = 10, statusFilter = null }) {
        const offset = (page - 1) * pageSize;
        
        const whereClause = {};
        if (statusFilter && statusFilter !== 'ALL') {
          whereClause.status = statusFilter;
        }

        const { count, rows } = await notification.findAndCountAll({
          where: whereClause,
          limit: pageSize,
          offset: offset,
          order: [['emittedAt', 'DESC']]
        });
        

        const notifications = rows.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            status: n.status, 
            emittedAt: n.emittedAt 
                ? dayjs(n.emittedAt).format("DD/MM/YYYY HH:mm:ss") 
                : null,
            attendedAt: n.attendedAt 
                ? dayjs(n.attendedAt).format("DD/MM/YYYY HH:mm:ss") 
                : null,
            from:n.from
        }));

        return {
          notifications,
          total: count,
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(count / pageSize)
        };
    }

    async attendNotifications(notificationIds) {
        try {
          const result = await notification.update(
            { 
              status: 'in_process'
            },
            {
              where: {
                id: notificationIds,
                status: 'not_attended'
              }
            }
          );
          
          return {
            success: true,
            updatedCount: result[0],
            fromList: await this.getFromList(notificationIds)
          };
        } catch (error) {
          console.error("Error attending notifications:", error);
          throw error;
        }
    }
      
    async getFromList(notificationIds) {
        const notifications = await notification.findAll({
          where: {
            id: notificationIds
          }
        });
        console.log("en proceso",notifications)
        return notifications;
    }
}

export default new NotificationService();
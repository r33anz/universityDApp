import UseCaseNotification from "../../application/usesCases/notification/UseCaseNotification.js";

class NotificationController{

    async recoverAllNotifications(req,res){
        try {

            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const statusFilter = req.query.status || null;
            
            if (!req.query.page && !req.query.pageSize && !req.query.status) {
                const notifications = await UseCaseNotification.revoverAllNotifications();
                if (notifications.length === 0) {
                    return res.json({ 
                        success: true, 
                        data: [],
                        message: "No hay notificaciones disponibles" 
                    });
                }
                return res.status(200).json({ 
                    success: true, data: notifications 
                });
            }

            const result = await UseCaseNotification.getPaginatedNotifications({
                page,
                pageSize,
                statusFilter
            });

            if (result.notifications.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    message: "No hay notificaciones con los filtros aplicados",
                    pagination: result.pagination
                });
            }

            res.status(200).json({
                success: true,
                data: result.notifications,
                pagination: result.pagination
            });

        } catch (error) {
            console.error("Error fetching notifications:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    async attendMultipleNotifications(req, res) {
        try {
          const { notificationIds } = req.body;
          
          if (!notificationIds || !Array.isArray(notificationIds)) {
            return res.status(400).json({ 
              success: false, 
              message: "Se requiere un array de IDs de notificaciones" 
            });
          }
      
          const result = await UseCaseNotification.attendNotifications(notificationIds);
          
          res.status(200).json({
            success: true,
            updatedCount: result.updatedCount,
            fromList: result.fromList 
          });
        } catch (error) {
          console.error("Error attending notifications:", error);
          res.status(500).json({ 
            success: false, 
            message: "Error al atender notificaciones" 
          });
        }
      }
}

export default new NotificationController();
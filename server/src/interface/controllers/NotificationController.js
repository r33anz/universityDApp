import UseCaseNotification from "../../application/useCases/notification/UseCaseNotification.js";
import AppError from "../error/AppError.js";

class NotificationController {
    async recoverAllNotifications(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const statusFilter = req.query.status || null;

            if (!req.query.page && !req.query.pageSize && !req.query.status) {
                const notifications = await UseCaseNotification.recoverAllNotifications();
                if (notifications.length === 0) {
                    return res.json({
                        success: true,
                        data: [],
                        message: "No hay notificaciones disponibles",
                    });
                }
                return res.status(200).json({ success: true, data: notifications });
            }

            const result = await UseCaseNotification.getPaginatedNotifications({
                page, pageSize, statusFilter,
            });

            if (result.notifications.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    message: "No hay notificaciones con los filtros aplicados",
                    pagination: result.pagination,
                });
            }

            res.status(200).json({
                success: true,
                data: result.notifications,
                pagination: result.pagination,
            });
        } catch (e) { next(e); }
    }

    async attendMultipleNotifications(req, res, next) {
        try {
            const { notificationIds } = req.body;
            if (!notificationIds || !Array.isArray(notificationIds)) {
                throw AppError.badRequest("Se requiere un array de IDs de notificaciones");
            }

            const result = await UseCaseNotification.attendNotifications(notificationIds);

            res.status(200).json({
                success: true,
                updatedCount: result.updatedCount,
                fromList: result.fromList,
            });
        } catch (e) { next(e); }
    }
}

export default new NotificationController();

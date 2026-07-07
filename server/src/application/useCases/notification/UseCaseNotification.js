import EmailService from "../../services/EmailService.js";
import NotificationService from "../../services/NotificationService.js";
import config from "../../../infrastructure/config/env.js";

class UseCaseNotification {

    async recoverAllNotifications() {
        return await NotificationService.getAllNotifications();
    }

    async getPaginatedNotifications({ page, pageSize, statusFilter }) {
        return await NotificationService.getPaginatedNotifications({
            page, pageSize, statusFilter,
        });
    }

    async attendNotifications(notificationIds) {
        const sisCodes = await NotificationService.recoverSisCodes(notificationIds);
        await EmailService.sendSisCodes(config.mail.adminRecipient, sisCodes);
        return await NotificationService.attendNotifications(notificationIds);
    }
}

export default new UseCaseNotification();

import createTransporter from "../../infrastructure/mail/mailSenderConnection.js";
import { recoveryCodesTemplate } from "../../infrastructure/mail/template/websisSendingSISCodeTemplate.js";
import config from "../../infrastructure/config/env.js";

class EmailService {
    constructor() {
        this.transporter = createTransporter();
    }

    async sendSisCodes(email, codes) {
        try {
            const mailOptions = {
                from: `"Soporte Universidad" <${config.mail.user}>`,
                to: email,
                subject: 'Solicitud de kardex',
                html: recoveryCodesTemplate(codes),
            };

            const info = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send recovery codes email');
        }
    }
}

export default new EmailService();

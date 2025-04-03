import createTransporter from "../../infraestructure/mail/mailSenderConnection.js";
import { recoveryCodesTemplate } from "../../infraestructure/mail/template/websisSendingSISCodeTemplate.js";

class EmailService {
    constructor() {
      this.transporter = createTransporter();
    }
  
    async sendSisCodes(email, codes) {
      try {
        const mailOptions = {
          from: `"Soporte Universidad" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Tus códigos de recuperación',
          html: recoveryCodesTemplate(codes)
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
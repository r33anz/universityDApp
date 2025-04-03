import envConfig from "../../envConfig.js";
import nodemailer from 'nodemailer';

const createTransporter = () => {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: envConfig.EMAIL_USER,
        pass: envConfig.EMAIL_PASS
      }
    });
  };
  
  export default createTransporter;
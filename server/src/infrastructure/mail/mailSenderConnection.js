import config from "../config/env.js";
import nodemailer from 'nodemailer';

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.mail.user,
            pass: config.mail.pass,
        },
    });
};

export default createTransporter;

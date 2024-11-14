import { Injectable } from '@nestjs/common';
import { env } from 'configs';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',  // SMTP host (e.g., smtp.example.com)
      port: 587,               // SMTP port (e.g., 587 for TLS)
      secure: false,           // true for 465, false for other ports
      auth: {
        user: env.MAIL.USERNAME,  // SMTP username
        pass: env.MAIL.PASSWORD       // SMTP password
      },
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const mailOptions = {
      from: env.MAIL.USERNAME,
      to,
      subject,
      text,
      html,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
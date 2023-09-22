import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../config/logger';

const { MAILER_PASSWORD, MAILER_HOST, MAILER_PORT, MAILER_USER } = process.env;

if (!MAILER_PASSWORD || !MAILER_HOST || !MAILER_PORT || !MAILER_USER) {
  throw new Error('Mail serer configuration variables are missing');
}

class EmailService {
  private static instance: EmailService;
  private transporter: Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: MAILER_HOST,
      port: Number(MAILER_PORT),
      secure: true,
      auth: {
        user: MAILER_USER,
        pass: MAILER_PASSWORD,
      },
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const info = await this.transporter.sendMail({
      from: '"Sugar Hunter" <sugar.hunter@meta.ua>',
      to,
      subject,
      html,
    });

    logger.info(`Message sent: ${info.messageId}`);
  }
}

export default EmailService;

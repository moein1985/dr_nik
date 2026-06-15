import nodemailer from "nodemailer";
import type {
  EmailSenderPort,
  SendEmailInput,
} from "../domain/email-sender.port";
import { env } from "@/server/config/env";

export class SmtpEmailSender implements EmailSenderPort {
  private readonly transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
  });

  async send(input: SendEmailInput): Promise<void> {
    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
  }
}

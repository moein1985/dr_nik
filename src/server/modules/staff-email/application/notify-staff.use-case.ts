import type { EmailSenderPort } from "../domain/email-sender.port";

export type NotifyStaffInput = {
  subject: string;
  html: string;
  to: string;
};

export class NotifyStaffUseCase {
  constructor(private readonly emailSender: EmailSenderPort) {}

  async execute(input: NotifyStaffInput): Promise<void> {
    await this.emailSender.send({
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
  }
}

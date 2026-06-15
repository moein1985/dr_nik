import type { SmsSenderPort } from "../domain/sms-sender.port";

export class KavenegarSmsSender implements SmsSenderPort {
  constructor(private readonly apiKey: string, private readonly sender: string) {}

  async sendOtp(phoneNumber: string, otpCode: string): Promise<void> {
    const endpoint = "https://api.kavenegar.com/v1";
    const url = `${endpoint}/${this.apiKey}/verify/lookup.json`;

    const body = new URLSearchParams({
      receptor: phoneNumber,
      token: otpCode,
      template: this.sender,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      throw new Error("Failed to send OTP via Kavenegar");
    }
  }
}

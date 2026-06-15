import type { SmsSenderPort } from "../domain/sms-sender.port";

export class MockSmsSender implements SmsSenderPort {
  private readonly latestOtpByPhone = new Map<string, string>();

  async sendOtp(phoneNumber: string, otpCode: string): Promise<void> {
    // Development-only sender until external provider is active.
    this.latestOtpByPhone.set(phoneNumber.trim(), otpCode);
    console.log(`[mock-sms] otp for ${phoneNumber}: ${otpCode}`);
  }

  getLatestOtp(phoneNumber: string): string | null {
    return this.latestOtpByPhone.get(phoneNumber.trim()) ?? null;
  }
}

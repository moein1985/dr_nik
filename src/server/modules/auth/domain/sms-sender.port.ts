export interface SmsSenderPort {
  sendOtp(phoneNumber: string, otpCode: string): Promise<void>;
}

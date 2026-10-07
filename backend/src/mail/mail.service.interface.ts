

export interface IMailService {
  sendOtpEmail(to: string, code: string): Promise<void>;
  sendConnectionRequestEmail(to: string, receiverName: string | null, requesterName: string | null, compatibilityScore?: number): Promise<void>;
  sendConnectionAcceptedEmail(to: string, requesterName: string | null, acceptedByName: string | null): Promise<void>;
}

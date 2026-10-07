import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('resend.apiKey')!);
  }

  /**
   * Helper to wrap raw body content inside the unified BRICK email shell
   */
  private getEmailTemplate(contentHtml: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 10px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #0f172a; padding: 28px 32px; text-align: left; border-bottom: 3px solid #84cc16;">
                      <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; font-family: sans-serif;">
                        BRICK<span style="color: #a3e635;">.</span>
                      </span>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 36px 32px; color: #334155;">
                      ${contentHtml}
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 32px; background-color: #f1f5f9; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                        Need help? Visit <a href="https://www.bricknigeria.com" style="color: #0f172a; text-decoration: underline;">BRICK Nigeria</a>.<br>
                        &copy; ${new Date().getFullYear()} BRICK. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  async sendOtpEmail(to: string, code: string): Promise<void> {
    const from = this.configService.get<string>('mail.from')!;
    const subject = 'Your BRICK Verification Code';

    const bodyContent = `
      <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a;">
        Verify Your Email 🔑
      </h2>
      
      <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #475569;">
        Use the code below to complete your account verification process on BRICK:
      </p>

      <!-- OTP Display Box -->
      <div style="margin: 24px 0; padding: 20px; background-color: #f1f5f9; border-radius: 12px; text-align: center; border: 1px dashed #cbd5e1;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a; font-family: monospace;">
          ${code}
        </span>
      </div>

      <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: #64748b;">
        ⏱️ This code expires in <strong>5 minutes</strong>.
      </p>
      <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
        If you didn't request this verification code, please ignore this message.
      </p>
    `;

    const html = this.getEmailTemplate(bodyContent);

    try {
      const { error } = await this.resend.emails.send({ from, to, subject, html });
      if (error) {
        this.logger.error(`Resend error sending to ${to}: ${error.message}`, error);
        throw new Error('Failed to send email');
      }
      this.logger.log(`OTP email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send OTP to ${to}`, err);
      throw err;
    }
  }

  /**
   * Onboarding email sent once, right after an account is created.
   * Never awaited by the signup request — a mail outage must not fail signup.
   */
  async sendWelcomeEmail(to: string, name?: string | null): Promise<void> {
    const from = this.configService.get<string>('mail.from')!;
    const subject = 'Welcome to BRICK 🎉';
    const greeting = name?.trim() ? name.trim() : 'there';

    const bodyContent = `
      <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a;">
        Welcome to BRICK, ${greeting}! 👋
      </h2>

      <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #475569;">
        Your account is ready. BRICK matches Nigerian students with compatible roommates
        using budget, university, lifestyle and move-in timing — so you can find the right
        person before you sign a lease.
      </p>

      <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: #0f172a;">
        Three steps to your first match:
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 8px;">
        <tr>
          <td style="padding: 12px 16px; background-color: #f8fafc; border-left: 3px solid #84cc16; border-radius: 8px;">
            <strong style="color: #0f172a; font-size: 14px;">1. Complete your profile</strong>
            <span style="display: block; margin-top: 4px; font-size: 13px; color: #64748b; line-height: 1.5;">
              Add your university, budget range and move-in date.
            </span>
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>
        <tr>
          <td style="padding: 12px 16px; background-color: #f8fafc; border-left: 3px solid #84cc16; border-radius: 8px;">
            <strong style="color: #0f172a; font-size: 14px;">2. Add your lifestyle tags</strong>
            <span style="display: block; margin-top: 4px; font-size: 13px; color: #64748b; line-height: 1.5;">
              Cleanliness, sleep schedule and study habits sharpen your match score.
            </span>
          </td>
        </tr>
        <tr><td style="height: 8px;"></td></tr>
        <tr>
          <td style="padding: 12px 16px; background-color: #f8fafc; border-left: 3px solid #84cc16; border-radius: 8px;">
            <strong style="color: #0f172a; font-size: 14px;">3. Send your first request</strong>
            <span style="display: block; margin-top: 4px; font-size: 13px; color: #64748b; line-height: 1.5;">
              Browse ranked matches and connect with the ones that fit.
            </span>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px;">
        <tr>
          <td align="center" style="border-radius: 10px; background-color: #0f172a;">
            <a href="https://www.bricknigeria.com/student/profile" target="_blank" style="font-size: 15px; font-weight: 600; color: #a3e635; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 10px;">
              Complete my profile &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="margin: 16px 0 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
        You're receiving this because an account was created with this email address on BRICK.
      </p>
    `;

    const html = this.getEmailTemplate(bodyContent);

    try {
      const { error } = await this.resend.emails.send({ from, to, subject, html });
      if (error) {
        this.logger.error(`Resend error sending welcome email to ${to}: ${error.message}`, error);
        throw new Error('Failed to send email');
      }
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send welcome email to ${to}`, err);
      throw err;
    }
  }

  async sendConnectionRequestEmail(
    to: string,
    requesterName: string,
    receiverName: string,
  ): Promise<void> {
    const from = this.configService.get<string>('mail.from')!;
    const subject = `${requesterName} wants to be your roommate on BRICK`;

    const bodyContent = `
      <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a;">
        New Roommate Request! 🎉
      </h2>
      
      <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #475569;">
        Hi <strong>${receiverName}</strong>,
      </p>
      
      <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #475569;">
        <strong style="color: #0f172a;">${requesterName}</strong> sent you a roommate request on BRICK. Check out their profile to see if you're a good match!
      </p>

      <!-- CTA Button -->
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px;">
        <tr>
          <td align="center" style="border-radius: 10px; background-color: #0f172a;">
            <a href="https://www.bricknigeria.com/student/inbox" target="_blank" style="font-size: 15px; font-weight: 600; color: #a3e635; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 10px;">
              View Request &rarr;
            </a>
          </td>
        </tr>
      </table>
    `;

    const html = this.getEmailTemplate(bodyContent);

    try {
      const { error } = await this.resend.emails.send({ from, to, subject, html });
      if (error) {
        this.logger.error(`Resend error sending connection request email to ${to}: ${error.message}`, error);
        throw new Error('Failed to send email');
      }
      this.logger.log(`Connection request email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send connection request email to ${to}`, err);
      throw err;
    }
  }

  async sendConnectionAcceptedEmail(
    to: string,
    accepterName: string,
    requesterName: string,
  ): Promise<void> {
    const from = this.configService.get<string>('mail.from')!;
    const subject = `${accepterName} accepted your roommate request on BRICK`;

    const bodyContent = `
      <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a;">
        It's a Match! 🤝
      </h2>
      
      <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #475569;">
        Hi <strong>${requesterName}</strong>,
      </p>
      
      <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #475569;">
        Great news! <strong style="color: #0f172a;">${accepterName}</strong> accepted your roommate request. You can now get in touch and plan your next steps together.
      </p>

      <!-- CTA Button -->
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 28px 0 12px;">
        <tr>
          <td align="center" style="border-radius: 10px; background-color: #0f172a;">
            <a href="https://www.bricknigeria.com/student/inbox" target="_blank" style="font-size: 15px; font-weight: 600; color: #a3e635; text-decoration: none; padding: 14px 28px; display: inline-block; border-radius: 10px;">
              View Connection &rarr;
            </a>
          </td>
        </tr>
      </table>
    `;

    const html = this.getEmailTemplate(bodyContent);

    try {
      const { error } = await this.resend.emails.send({ from, to, subject, html });
      if (error) {
        this.logger.error(`Resend error sending accepted email to ${to}: ${error.message}`, error);
        throw new Error('Failed to send email');
      }
      this.logger.log(`Connection accepted email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send accepted email to ${to}`, err);
      throw err;
    }
  }
}
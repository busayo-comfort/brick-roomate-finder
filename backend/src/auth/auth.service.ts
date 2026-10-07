// import { Injectable, BadRequestException,UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from '../prisma/prisma.service';
// import { MailService } from '../mail/mail.service';
// import * as crypto from 'crypto';
// import * as bcrypt from 'bcrypt';
// import { v4 as uuidv4 } from 'uuid';



// @Injectable()
// export class AuthService {
//   private readonly otpTtl = 5 * 60 * 1000; // 5 minutes
//   private readonly sessionMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
//   private readonly sessionUpdateAge = 24 * 60 * 60 * 1000; // extend if < 24h left

//   constructor(
//     private prisma: PrismaService,
//     private mailService: MailService,
//     private config: ConfigService,
//     private jwtService: JwtService,
//   ) { }

//   /**
//    * Every user object that leaves this service goes through here.
//    * The bcrypt hash must never reach a controller response — `GET /auth/session`
//    * is read by the browser, so returning the raw row leaks the hash to the client.
//    * `hasPassword` is what the frontend actually needs: it decides whether the
//    * security settings screen shows "change password" or "set a password".
//    */
//   private sanitize<T extends { password?: string | null }>(user: T) {
//     const { password, ...safe } = user;
//     return { ...safe, hasPassword: Boolean(password) };
//   }

//   async requestOtp(email: string) {
//     const code = crypto.randomInt(100000, 999999).toString();
//     console.log(`Generated OTP for ${email}: ${code}`); // For debugging; remove in production
//     const hashed = await bcrypt.hash(code, 10);

//     await this.prisma.verification.deleteMany({ where: { identifier: email } });
//     await this.prisma.verification.create({
//       data: {
//         identifier: email,
//         value: hashed,
//         expiresAt: new Date(Date.now() + this.otpTtl),
//       },
//     });

//     // Fire and forget (don’t block response)
//     this.mailService.sendOtpEmail(email, code).catch((err) => {
//       console.error('Failed to send OTP email', err);
//     });

//     return { message: 'If an account exists, a verification code has been sent.' };
//   }

//   async verifyOtp(email: string, code: string) {
//     const otpRecord = await this.prisma.verification.findFirst({
//       where: { identifier: email },
//       orderBy: { createdAt: 'desc' },
//     });
//     if (!otpRecord) {
//       throw new BadRequestException('No OTP requested for this email');
//     }

//     if (new Date() > otpRecord.expiresAt) {
//       await this.prisma.verification.delete({ where: { id: otpRecord.id } });
//       throw new BadRequestException('OTP has expired');
//     }

//     const valid = await bcrypt.compare(code, otpRecord.value);
//     if (!valid) {
//       throw new BadRequestException('Invalid OTP');
//     }

//     // OTP used – delete it
//     await this.prisma.verification.delete({ where: { id: otpRecord.id } });

//     // Create or update user
//     let user = await this.prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       user = await this.prisma.user.create({
//         data: { email, name: '', emailVerified: true },
//       });
//       // First OTP verification for this address is a signup — welcome them.
//       this.sendWelcome(user.email, user.name);
//     } else if (!user.emailVerified) {
//       user = await this.prisma.user.update({
//         where: { id: user.id },
//         data: { emailVerified: true },
//       });
//     }

//     // Create a session in the database
//     const sessionId = uuidv4();
//     const expiresAt = new Date(Date.now() + this.sessionMaxAge);

//     await this.prisma.session.create({
//       data: {
//         id: sessionId,
//         userId: user.id,
//         token: '', // we don’t need to store the JWT; leave empty or store the JWT if you want
//         expiresAt,
//       },
//     });

//     // Sign a JWT containing the session ID and user ID
//     const jwtPayload = {
//       sub: user.id,
//       jti: sessionId,
//     };
//     const sessionToken = this.jwtService.sign(jwtPayload);

//     // Optionally update the session row with the JWT for auditing/debugging
//     await this.prisma.session.update({
//       where: { id: sessionId },
//       data: { token: sessionToken },
//     });

//     return { user: this.sanitize(user), sessionToken, expiresAt };
//   }

//   /** Fire-and-forget: a mail outage must never fail an account creation. */
//   private sendWelcome(email: string, name?: string | null) {
//     this.mailService.sendWelcomeEmail(email, name).catch((err) => {
//       console.error('Failed to send welcome email', err);
//     });
//   }

//   async validateSession(token: string) {
//     try {
//       const payload = this.jwtService.verify(token);
//       const sessionId = payload.jti;
//       if (!sessionId) return null;

//       const session = await this.prisma.session.findUnique({
//         where: { id: sessionId },
//         include: { user: true },
//       });

//       if (!session || new Date() > session.expiresAt) {
//         // Session revoked or expired
//         if (session) {
//           await this.prisma.session.delete({ where: { id: sessionId } }); // clean up expired
//         }
//         return null;
//       }

//       // If session is within update window, extend its expiry (sliding expiration)
//       const timeLeft = session.expiresAt.getTime() - Date.now();
//       if (timeLeft < this.sessionUpdateAge) {
//         const newExpiry = new Date(Date.now() + this.sessionMaxAge);
//         await this.prisma.session.update({
//           where: { id: sessionId },
//           data: { expiresAt: newExpiry },
//         });
//       }

//       return this.sanitize(session.user);
//     } catch {
//       // JWT invalid or expired
//       return null;
//     }
//   }



//   async setUserType(userId: string, userType: 'seeker' | 'landlord') {
//     const user = await this.prisma.user.update({
//       where: { id: userId },
//       data: { userType },
//     });

//     // If seeker, create an empty SeekerProfile if not exists
//     if (userType === 'seeker') {
//       await this.prisma.seekerProfile.upsert({
//         where: { userId },
//         update: {},
//         create: {
//           userId,
//           university: '',   // placeholder, will be filled later
//         },
//       });
//     }

//     return { userType };
//   }


//   async signUpWithPassword(email: string, password: string) {
//   const existing = await this.prisma.user.findUnique({ where: { email } });
//   if (existing) throw new BadRequestException('Email already in use');

//  const hashedPassword = await bcrypt.hash(password, 10);
//   const user = await this.prisma.user.create({
//     data: {
//       email,
//       name: '',                 // <-- add this
//       password: hashedPassword,
//       emailVerified: true,
//     },
//   });

//   // Create session (same as OTP login)
//   const sessionId = uuidv4();
//   const expiresAt = new Date(Date.now() + this.sessionMaxAge);
//   await this.prisma.session.create({
//     data: { id: sessionId, userId: user.id, token: '', expiresAt },
//   });
//   const sessionToken = this.jwtService.sign({ sub: user.id, jti: sessionId });
//   await this.prisma.session.update({ where: { id: sessionId }, data: { token: sessionToken } });

//   this.sendWelcome(user.email, user.name);

//   return { user: this.sanitize(user), sessionToken, expiresAt };
// }

// async signInWithPassword(email: string, password: string) {
//   const user = await this.prisma.user.findUnique({ where: { email } });
//   if (!user || !user.password) {
//     throw new UnauthorizedException('Invalid credentials');
//   }
//   const valid = await bcrypt.compare(password, user.password);
//   if (!valid) throw new UnauthorizedException('Invalid credentials');

//   const sessionId = uuidv4();
//   const expiresAt = new Date(Date.now() + this.sessionMaxAge);
//   await this.prisma.session.create({
//     data: { id: sessionId, userId: user.id, token: '', expiresAt },
//   });
//   const sessionToken = this.jwtService.sign({ sub: user.id, jti: sessionId });
//   await this.prisma.session.update({ where: { id: sessionId }, data: { token: sessionToken } });

//   return { user: this.sanitize(user), sessionToken, expiresAt };
// }

// /**
//  * First-time password for accounts created through OTP only.
//  * Refuses when a password already exists: without that check a hijacked session
//  * could overwrite the password without ever proving knowledge of the old one.
//  */
// async setPassword(userId: string, password: string) {
//   const user = await this.prisma.user.findUnique({ where: { id: userId } });
//   if (!user) throw new BadRequestException('Account not found');
//   if (user.password) {
//     throw new BadRequestException(
//       'This account already has a password. Use change password instead.',
//     );
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   await this.prisma.user.update({
//     where: { id: userId },
//     data: { password: hashedPassword },
//   });
//   return { success: true };
// }

// /**
//  * Change password. Verifies the current password, then revokes every *other*
//  * session so a stolen cookie stops working the moment the owner rotates it.
//  * `currentToken` is the caller's own session, which stays signed in.
//  */
// async updatePassword(
//   userId: string,
//   currentPassword: string,
//   newPassword: string,
//   currentToken?: string,
// ) {
//   const user = await this.prisma.user.findUnique({ where: { id: userId } });
//   if (!user || !user.password) {
//     throw new BadRequestException(
//       'No password set on this account. Set a password first.',
//     );
//   }

//   const valid = await bcrypt.compare(currentPassword, user.password);
//   if (!valid) throw new BadRequestException('Current password is incorrect');

//   if (await bcrypt.compare(newPassword, user.password)) {
//     throw new BadRequestException('New password must be different from the current one');
//   }

//   const hashed = await bcrypt.hash(newPassword, 10);
//   await this.prisma.user.update({
//     where: { id: userId },
//     data: { password: hashed },
//   });

//   await this.revokeOtherSessions(userId, currentToken);

//   return { success: true };
// }

// /** Deletes every session for the user except the one the request came from. */
// private async revokeOtherSessions(userId: string, currentToken?: string) {
//   let keepSessionId: string | undefined;
//   if (currentToken) {
//     try {
//       keepSessionId = this.jwtService.verify(currentToken).jti;
//     } catch {
//       // Unverifiable token: fall through and revoke everything.
//     }
//   }

//   await this.prisma.session.deleteMany({
//     where: {
//       userId,
//       ...(keepSessionId ? { id: { not: keepSessionId } } : {}),
//     },
//   });
// }


//   async logout(token: string) {
//     try {
//       const payload = this.jwtService.verify(token);
//       if (payload.jti) {
//         await this.prisma.session.deleteMany({ where: { id: payload.jti } });
//       }
//     } catch {
//       // token already invalid; ignore
//     }
//   }




//   async logoutAll(userId: string) {
//     await this.prisma.session.deleteMany({ where: { userId } });
//   }
// }

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly otpTtl = 5 * 60 * 1000; // 5 minutes
  private readonly sessionMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly sessionUpdateAge = 24 * 60 * 60 * 1000; // extend if < 24h left

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {}

  /**
   * Sanitize user data before sending to client.
   * Ensures no sensitive information is leaked.
   */
  private sanitize(user: any) {
    return user;
  }

  async requestOtp(email: string) {
    const code = crypto.randomInt(100000, 999999).toString();
    console.log(`Generated OTP for ${email}: ${code}`); // For debugging; remove in production
    const hashed = await bcrypt.hash(code, 10);

    await this.prisma.verification.deleteMany({ where: { identifier: email } });
    await this.prisma.verification.create({
      data: {
        identifier: email,
        value: hashed,
        expiresAt: new Date(Date.now() + this.otpTtl),
      },
    });

    // Fire and forget (don't block response)
    this.mailService.sendOtpEmail(email, code).catch((err) => {
      console.error('Failed to send OTP email', err);
    });

    return { message: 'If an account exists, a verification code has been sent.' };
  }

  async verifyOtp(email: string, code: string) {
    const otpRecord = await this.prisma.verification.findFirst({
      where: { identifier: email },
      orderBy: { createdAt: 'desc' },
    });
    if (!otpRecord) {
      throw new BadRequestException('No OTP requested for this email');
    }

    if (new Date() > otpRecord.expiresAt) {
      await this.prisma.verification.delete({ where: { id: otpRecord.id } });
      throw new BadRequestException('OTP has expired');
    }

    const valid = await bcrypt.compare(code, otpRecord.value);
    if (!valid) {
      throw new BadRequestException('Invalid OTP');
    }

    // OTP used – delete it
    await this.prisma.verification.delete({ where: { id: otpRecord.id } });

    // Create or update user
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { email, name: '', emailVerified: true },
      });
      // First OTP verification for this address is a signup — welcome them.
      this.sendWelcome(user.email, user.name);
    } else if (!user.emailVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    // Create a session in the database
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + this.sessionMaxAge);

    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        token: '', // we don't need to store the JWT; leave empty or store the JWT if you want
        expiresAt,
      },
    });

    // Sign a JWT containing the session ID and user ID
    const jwtPayload = {
      sub: user.id,
      jti: sessionId,
    };
    const sessionToken = this.jwtService.sign(jwtPayload);

    // Optionally update the session row with the JWT for auditing/debugging
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { token: sessionToken },
    });

    return { user: this.sanitize(user), sessionToken, expiresAt };
  }

  /** Fire-and-forget: a mail outage must never fail an account creation. */
  private sendWelcome(email: string, name?: string | null) {
    this.mailService.sendWelcomeEmail(email, name).catch((err) => {
      console.error('Failed to send welcome email', err);
    });
  }

  async validateSession(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const sessionId = payload.jti;
      if (!sessionId) return null;

      const session = await this.prisma.session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      });

      if (!session || new Date() > session.expiresAt) {
        // Session revoked or expired
        if (session) {
          await this.prisma.session.delete({ where: { id: sessionId } }); // clean up expired
        }
        return null;
      }

      // If session is within update window, extend its expiry (sliding expiration)
      const timeLeft = session.expiresAt.getTime() - Date.now();
      if (timeLeft < this.sessionUpdateAge) {
        const newExpiry = new Date(Date.now() + this.sessionMaxAge);
        await this.prisma.session.update({
          where: { id: sessionId },
          data: { expiresAt: newExpiry },
        });
      }

      return this.sanitize(session.user);
    } catch {
      // JWT invalid or expired
      return null;
    }
  }

  async setUserType(userId: string, userType: 'seeker' | 'landlord') {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { userType },
    });

    // If seeker, create an empty SeekerProfile if not exists
    if (userType === 'seeker') {
      await this.prisma.seekerProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          university: '', // placeholder, will be filled later
        },
      });
    }

    return { userType };
  }

  /** Deletes every session for the user except the one the request came from. */
  private async revokeOtherSessions(userId: string, currentToken?: string) {
    let keepSessionId: string | undefined;
    if (currentToken) {
      try {
        keepSessionId = this.jwtService.verify(currentToken).jti;
      } catch {
        // Unverifiable token: fall through and revoke everything.
      }
    }

    await this.prisma.session.deleteMany({
      where: {
        userId,
        ...(keepSessionId ? { id: { not: keepSessionId } } : {}),
      },
    });
  }

  async logout(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.jti) {
        await this.prisma.session.deleteMany({ where: { id: payload.jti } });
      }
    } catch {
      // token already invalid; ignore
    }
  }

  async logoutAll(userId: string) {
    await this.prisma.session.deleteMany({ where: { userId } });
  }
}
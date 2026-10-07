// import {
//   Controller,
//   Post,
//   Body,
//   Get,
//   Patch,
//   Req,
//   Res,
//   HttpCode,
//   HttpStatus,
//   UseGuards,
//   Put,
// } from "@nestjs/common";
// import type { Request, Response } from "express";
// import { AuthService } from "./auth.service";
// import { RequestOtpDto, VerifyOtpDto } from "./dto";
// import { AllowAnonymous } from "../decorators/allow-anonymous.decorator";
// import { OptionalAuth } from "../decorators/optional-auth.decorator";
// import { Session } from "../decorators/session.decorator";
// import { CurrentUser } from "../decorators/current-user.decorator";
// import { AuthGuard } from "../guards/auth.guard";
// import { RateLimitGuard } from "../common/rate-limit/rate-limit.guard";
// import { RateLimit } from "../common/rate-limit/rate-limit.decorator";
// import {
//   PasswordSignUpDto,
//   PasswordSignInDto,
//   SetPasswordDto,
// } from "./dto/password.dto";
//  import { UpdatePasswordDto } from './dto/update-password.dto';








// @Controller("auth")
// @UseGuards(RateLimitGuard) // apply rate limiter to all auth routes
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post("otp/request")
//   @AllowAnonymous()
//   @HttpCode(HttpStatus.OK)
//   @RateLimit({ windowMs: 60_000, max: 3, keyPrefix: "otp-request-ip" })
//   async requestOtp(@Body() body: RequestOtpDto) {
//     return this.authService.requestOtp(body.email);
//   }

//   @Post("otp/verify")
//   @AllowAnonymous()
//   @HttpCode(HttpStatus.OK)
//   @RateLimit({ windowMs: 60_000, max: 5, keyPrefix: "otp-verify-ip" })
//   async verifyOtp(
//     @Body() body: VerifyOtpDto,
//     @Res({ passthrough: true }) res: Response,
//   ) {
//     const { user, sessionToken, expiresAt } = await this.authService.verifyOtp(
//       body.email,
//       body.code,
//     );

//     res.cookie("brick.session_token", sessionToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production", // true on Render
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       path: "/",
//       expires: expiresAt,
//     });

//     return { user };
//   }

//   @Get("session")
//   @OptionalAuth()
//   getSession(@Session() user: any) {
//     return user ?? null;
//   }

//   @Get("me")
//   @UseGuards(AuthGuard)
//   me(@CurrentUser() user: any) {
//     return user;
//   }

//   @Post("logout")
//   @UseGuards(AuthGuard)
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
//     const token = req.cookies?.["brick.session_token"];
//     if (token) {
//       await this.authService.logout(token);
//     }
//     res.clearCookie("brick.session_token");
//   }

//   @Post("logout-all")
//   @UseGuards(AuthGuard)
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async logoutAll(
//     @CurrentUser("id") userId: string,
//     @Res({ passthrough: true }) res: Response,
//   ) {
//     await this.authService.logoutAll(userId);
//     res.clearCookie("brick.session_token");
//   }

//   @Patch("onboarding")
//   @HttpCode(HttpStatus.OK)
//   async onboarding(
//     @CurrentUser() user: any,
//     @Body() body: { userType: "seeker" | "landlord" },
//   ) {
//     return this.authService.setUserType(user.id, body.userType);
//   }

//   // Inside AuthController class:

//   @Post("password/signup")
//   @AllowAnonymous()
//   @HttpCode(HttpStatus.CREATED)
//   async passwordSignUp(
//     @Body() body: PasswordSignUpDto,
//     @Res({ passthrough: true }) res: Response,
//   ) {
//     const { user, sessionToken, expiresAt } =
//       await this.authService.signUpWithPassword(body.email, body.password);
//     res.cookie("brick.session_token", sessionToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       path: "/",
//       expires: expiresAt,
//     });
//     return { user };
//   }

//   @Post("password/login")
//   @AllowAnonymous()
//   @HttpCode(HttpStatus.OK)
//   async passwordSignIn(
//     @Body() body: PasswordSignInDto,
//     @Res({ passthrough: true }) res: Response,
//   ) {
//     const { user, sessionToken, expiresAt } =
//       await this.authService.signInWithPassword(body.email, body.password);
//     res.cookie("brick.session_token", sessionToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       path: "/",
//       expires: expiresAt,
//     });
//     return { user };
//   }

//   @Put("password/update")
//   @HttpCode(HttpStatus.OK)
//   @RateLimit({ windowMs: 60_000, max: 5, keyPrefix: "password-update-ip" })
//   async updatePassword(
//     @CurrentUser() user: any,
//     @Body() body: UpdatePasswordDto,
//     @Req() req: Request,
//   ) {
//     // The caller's own token is passed through so their session survives while
//     // every other session for the account is revoked.
//     return this.authService.updatePassword(
//       user.id,
//       body.currentPassword,
//       body.newPassword,
//       req.cookies?.["brick.session_token"],
//     );
//   }

//   @Put("password/set")
//   @HttpCode(HttpStatus.OK)
//   async setPassword(@CurrentUser() user: any, @Body() body: SetPasswordDto) {
//     return this.authService.setPassword(user.id, body.password);
//   }
// }

import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Put,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RequestOtpDto, VerifyOtpDto } from "./dto";
import { AllowAnonymous } from "../decorators/allow-anonymous.decorator";
import { OptionalAuth } from "../decorators/optional-auth.decorator";
import { Session } from "../decorators/session.decorator";
import { CurrentUser } from "../decorators/current-user.decorator";
import { AuthGuard } from "../guards/auth.guard";
import { RateLimitGuard } from "../common/rate-limit/rate-limit.guard";
import { RateLimit } from "../common/rate-limit/rate-limit.decorator";

@Controller("auth")
@UseGuards(RateLimitGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ============ OTP ENDPOINTS ============
  @Post("otp/request")
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @RateLimit({ windowMs: 60_000, max: 3, keyPrefix: "otp-request-ip" })
  async requestOtp(@Body() body: RequestOtpDto) {
    return this.authService.requestOtp(body.email);
  }

  @Post("otp/verify")
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  @RateLimit({ windowMs: 60_000, max: 5, keyPrefix: "otp-verify-ip" })
  async verifyOtp(
    @Body() body: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, sessionToken, expiresAt } = await this.authService.verifyOtp(
      body.email,
      body.code,
    );

    res.cookie("brick.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      expires: expiresAt,
    });

    return { user,     access_token: sessionToken,  // Add this line
 };
  }

  // ============ SESSION ENDPOINTS ============
  @Get("session")
  @OptionalAuth()
  getSession(@Session() user: any) {
    return user ?? null;
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: any) {
    return user;
  }

  @Post("logout")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.["brick.session_token"];
    if (token) {
      await this.authService.logout(token);
    }
    res.clearCookie("brick.session_token");
  }

  @Post("logout-all")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(
    @CurrentUser("id") userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(userId);
    res.clearCookie("brick.session_token");
  }

  // ============ ONBOARDING ENDPOINT ============
  @Patch("onboarding")
  @HttpCode(HttpStatus.OK)
  async onboarding(
    @CurrentUser() user: any,
    @Body() body: { userType: "seeker" | "landlord" },
  ) {
    return this.authService.setUserType(user.id, body.userType);
  }

  // ============ PASSWORD ENDPOINTS - COMMENTED OUT FOR OTP-ONLY PITCH ============
  /*
  @Post("password/signup")
  @AllowAnonymous()
  @HttpCode(HttpStatus.CREATED)
  async signUpWithPassword(@Body() body: SignUpPasswordDto) {
    return this.authService.signUpWithPassword(body.email, body.password);
  }

  @Post("password/login")
  @AllowAnonymous()
  @HttpCode(HttpStatus.OK)
  async signInWithPassword(
    @Body() body: SignInPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, sessionToken, expiresAt } = await this.authService.signInWithPassword(
      body.email,
      body.password,
    );
    res.cookie("brick.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      expires: expiresAt,
    });
    return { user };
  }

  @Post("password/set")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async setPassword(
    @CurrentUser("id") userId: string,
    @Body() body: { password: string },
  ) {
    return this.authService.setPassword(userId, body.password);
  }

  @Post("password/update")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @CurrentUser("id") userId: string,
    @Req() req: Request,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    const token = req.cookies?.["brick.session_token"];
    return this.authService.updatePassword(userId, body.currentPassword, body.newPassword, token);
  }
  */
  // ============ END PASSWORD ENDPOINTS ============
}
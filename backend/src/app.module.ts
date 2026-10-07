import configuration from './config/configuration';
import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { AuthGuard } from './guards/auth.guard';
import { RateLimitGuard } from './common/rate-limit/rate-limit.guard';
import { RolesGuard } from './common/roles/roles.guard';
import { SeekerModule } from './seeker/seeker.module';
import { MatchingModule } from './matching/matching.module';
import { ConnectionModule } from './connection/connection.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { UniversityModule } from './university/university.module';
import { HealthController } from './health/health.controller';
import { MessageModule } from 'messages/message.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    MailModule,
    AuthModule,
    SeekerModule,
    MatchingModule,
    ConnectionModule,
    UniversityModule,
    MessageModule
  ],
    controllers: [HealthController],   // <-- add this
  providers: [
    { provide: 'APP_GUARD', useClass: AuthGuard },
    { provide: 'APP_INTERCEPTOR', useClass: ResponseInterceptor },
    {
  provide: APP_PIPE,
  useFactory: () => new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
},
    { provide: 'APP_GUARD', useClass: RateLimitGuard },
    { provide: 'APP_GUARD', useClass: RolesGuard },
  ],
})
export class AppModule {}

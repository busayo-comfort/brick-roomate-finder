import { Module } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  providers: [ConnectionService],
  controllers: [ConnectionController],
  imports: [MailModule],
})
export class ConnectionModule {}

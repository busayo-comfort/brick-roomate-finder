import { Module } from '@nestjs/common';
import { SeekerService } from './seeker.service';
import { SeekerController } from './seeker.controller';

@Module({
  providers: [SeekerService],
  controllers: [SeekerController],
  exports: [SeekerService],
})
export class SeekerModule {}
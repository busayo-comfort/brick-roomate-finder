import { Controller, Get, Put, Body } from '@nestjs/common';
import { SeekerService } from './seeker.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import {UpdateSeekerDto} from './dto/update-seeker.dto';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('profile/seeker')
export class SeekerController {
  constructor(private readonly seekerService: SeekerService) {}

  @Get()
  async getProfile(@CurrentUser() user: any) {
    return this.seekerService.getProfile(user.id);
  }

@Put()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
async updateProfile(@CurrentUser() user: any, @Body() body: UpdateSeekerDto) {
  return this.seekerService.updateProfile(user.id, body);
}
}
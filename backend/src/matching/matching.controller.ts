import { Controller, Get, Query } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('matches')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get()
  async findMatches(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.matchingService.findMatches(user.id, page || 1, limit || 20);
  }
}
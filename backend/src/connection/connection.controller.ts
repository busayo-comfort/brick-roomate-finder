import { Controller, Post, Get, Put, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../common/roles/roles.decorator';

@Controller('connections')
@Roles('seeker')  // only seekers can use connections
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendRequest(@CurrentUser() user: any, @Body('receiverId') receiverId: string) {
    return this.connectionService.sendRequest(user.id, receiverId);
  }

  @Get('incoming')
  async getIncoming(@CurrentUser() user: any) {
    return this.connectionService.getIncoming(user.id);
  }

  @Get('outgoing')
  async getOutgoing(@CurrentUser() user: any) {
    return this.connectionService.getOutgoing(user.id);
  }

  @Put(':id/accept')
  async accept(@Param('id') id: string, @CurrentUser() user: any) {
    return this.connectionService.accept(id, user.id);
  }

  @Put(':id/reject')
  async reject(@Param('id') id: string, @CurrentUser() user: any) {
    return this.connectionService.reject(id, user.id);
  }

  @Put(':id/withdraw')
  async withdraw(@Param('id') id: string, @CurrentUser() user: any) {
    return this.connectionService.withdraw(id, user.id);
  }

  // Declared last so the literal routes above ('incoming', 'outgoing') are not
  // swallowed by the ':id' wildcard.
  @Get(':id')
  async getOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.connectionService.getOne(id, user.id);
  }
}
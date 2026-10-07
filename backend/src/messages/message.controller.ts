import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthGuard } from '../guards/auth.guard';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUser() user: any,
    @Body() body: { connectionId: string; content: string },
  ) {
    return this.messageService.sendMessage(user.id, body.connectionId, body.content);
  }

  @Get('conversations')
  async getConversations(@CurrentUser() user: any) {
    return this.messageService.getConversations(user.id);
  }

  @Get(':connectionId')
  async getMessages(
    @CurrentUser() user: any,
    @Param('connectionId') connectionId: string,
  ) {
    return this.messageService.getMessages(connectionId, user.id);
  }

  @Put(':messageId/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @CurrentUser() user: any,
    @Param('messageId') messageId: string,
  ) {
    return this.messageService.markAsRead(messageId, user.id);
  }
}
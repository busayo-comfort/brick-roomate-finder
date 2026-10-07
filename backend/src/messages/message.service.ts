import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(
    senderId: string,
    connectionId: string,
    content: string,
  ) {
    // Verify connection exists and is accepted
    const connection = await this.prisma.roommateConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new BadRequestException('Connection not found');
    }

    if (connection.status !== 'accepted') {
      throw new BadRequestException('Can only message accepted connections');
    }

    // Verify sender is part of this connection
    if (senderId !== connection.requesterId && senderId !== connection.receiverId) {
      throw new BadRequestException('Unauthorized');
    }

    // Determine recipient
    const recipientId =
      senderId === connection.requesterId ? connection.receiverId : connection.requesterId;

    return this.prisma.message.create({
      data: {
        connectionId,
        senderId,
        recipientId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        recipient: { select: { id: true, name: true, image: true } },
      },
    });
  }

  async getMessages(connectionId: string, userId: string) {
    // Verify user is part of this connection
    const connection = await this.prisma.roommateConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || (userId !== connection.requesterId && userId !== connection.receiverId)) {
      throw new BadRequestException('Unauthorized');
    }

    return this.prisma.message.findMany({
      where: { connectionId },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        recipient: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getConversations(userId: string) {
    // Get all accepted connections for the user
    const connections = await this.prisma.roommateConnection.findMany({
      where: {
        status: 'accepted',
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true, image: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return connections.map((conn) => {
      const isRequester = userId === conn.requesterId;
      const otherUser = isRequester ? conn.receiver : conn.requester;
      const lastMessage = conn.messages[0];

      return {
        id: conn.id,
        userId,
        otherUserId: otherUser.id,
        otherUserName: otherUser.name,
        otherUserImage: otherUser.image,
        lastMessage: lastMessage?.content ?? 'Start a conversation',
        lastMessageTime: lastMessage?.createdAt?.getTime() ?? 0,
        unreadCount: conn.messages.filter(
          (m) => m.recipientId === userId && !m.read,
        ).length,
      };
    });
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (message?.recipientId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { read: true },
    });
  }
}
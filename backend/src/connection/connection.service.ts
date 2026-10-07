import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";

/**
 * The profile card/modal on the frontend renders university, location, budget,
 * move-in date, bio and lifestyle tags. Those live on SeekerProfile, not User,
 * so every connection listing has to pull the profile in and flatten it — a
 * bare `{ id, name, image }` select is what made the profile modal render an
 * empty shell.
 */
const PARTY_SELECT = {
  id: true,
  name: true,
  image: true,
  seekerProfile: {
    select: {
      university: true,
      hasApartment: true,
      location: true,
      budgetMin: true,
      budgetMax: true,
      moveInDate: true,
      duration: true,
      genderPreference: true,
      occupation: true,
      bio: true,
      lifestyleTags: true,
    },
  },
} as const;

/** Flattens `{ ...user, seekerProfile }` into the single object the UI expects. */
function flattenParty<T extends { seekerProfile: object | null }>(party: T) {
  const { seekerProfile, ...user } = party;
  return { ...user, ...(seekerProfile ?? {}) };
}

@Injectable()
export class ConnectionService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async sendRequest(requesterId: string, receiverId: string) {
    if (requesterId === receiverId)
      throw new BadRequestException("Cannot send request to yourself");

    const existing = await this.prisma.roommateConnection.findFirst({
      where: { requesterId, receiverId, status: "pending" },
    });
    if (existing) throw new BadRequestException("Request already sent");

    const connection = await this.prisma.roommateConnection.create({
      data: { requesterId, receiverId },
      include: {
        requester: { select: { name: true, email: true } },
        receiver: { select: { name: true, email: true } },
      },
    });

    // Send email to receiver (non-blocking)
    const receiverEmail = connection.receiver.email;
    if (receiverEmail) {
      this.mailService
        .sendConnectionRequestEmail(
          receiverEmail,
          connection.requester.name || "Someone",
          connection.receiver.name || "there",
        )
        .catch((err) =>
          console.error("Failed to send connection request email", err),
        );
    }

    // Strip both parties off the response: `receiver.email` would otherwise hand
    // the requester the address that contact-reveal only grants after acceptance.
    const { requester, receiver, ...safe } = connection;
    return safe;
  }

  async getIncoming(userId: string) {
    const connections = await this.prisma.roommateConnection.findMany({
      where: { receiverId: userId },
      include: { requester: { select: PARTY_SELECT } },
      orderBy: { createdAt: 'desc' },
    });

    return connections.map(({ requester, ...connection }) => ({
      ...connection,
      requester: flattenParty(requester),
    }));
  }

  async getOutgoing(userId: string) {
    const connections = await this.prisma.roommateConnection.findMany({
      where: { requesterId: userId },
      include: { receiver: { select: PARTY_SELECT } },
      orderBy: { createdAt: 'desc' },
    });

    return connections.map(({ receiver, ...connection }) => ({
      ...connection,
      receiver: flattenParty(receiver),
    }));
  }

  /**
   * Single connection, from either side. The other party's email is only
   * included once the request was accepted — that is the contact reveal, and
   * gating it here means the address never leaves the server before then.
   */
  async getOne(connectionId: string, userId: string) {
    const conn = await this.prisma.roommateConnection.findUnique({
      where: { id: connectionId },
      include: {
        requester: { select: { ...PARTY_SELECT, email: true } },
        receiver: { select: { ...PARTY_SELECT, email: true } },
      },
    });
    if (!conn) throw new NotFoundException('Connection not found');

    const isRequester = conn.requesterId === userId;
    const isReceiver = conn.receiverId === userId;
    if (!isRequester && !isReceiver) {
      throw new ForbiddenException('Not part of this connection');
    }

    const { requester, receiver, ...connection } = conn;
    const other = isRequester ? receiver : requester;
    const contactRevealed = conn.status === 'accepted';
    const { email, ...otherWithoutEmail } = other;

    return {
      ...connection,
      contactRevealed,
      otherUser: {
        ...flattenParty(otherWithoutEmail),
        ...(contactRevealed ? { email } : {}),
      },
    };
  }

  async accept(connectionId: string, userId: string) {
  const conn = await this.prisma.roommateConnection.findUnique({
    where: { id: connectionId },
    include: {
      requester: { select: { name: true, email: true } },
      receiver: { select: { name: true, email: true } },
    },
  });
  if (!conn) throw new NotFoundException('Connection not found');
  if (conn.receiverId !== userId) throw new ForbiddenException('Only the receiver can accept');
  if (conn.status !== 'pending') {
    throw new BadRequestException(`This request was already ${conn.status}`);
  }

  const updated = await this.prisma.roommateConnection.update({
    where: { id: connectionId },
    data: { status: 'accepted' },
  });

  // Send email to requester (non-blocking)
  const requesterEmail = conn.requester.email;
  if (requesterEmail) {
    this.mailService.sendConnectionAcceptedEmail(
      requesterEmail,
      conn.receiver.name || 'Someone',
      conn.requester.name || 'there',
    ).catch(err => console.error('Failed to send acceptance email', err));
  }

  return updated;
}

  async reject(connectionId: string, userId: string) {
    const conn = await this.prisma.roommateConnection.findUnique({
      where: { id: connectionId },
    });
    if (!conn) throw new NotFoundException("Connection not found");
    if (conn.receiverId !== userId)
      throw new ForbiddenException("Only the receiver can reject");
    if (conn.status !== "pending")
      throw new BadRequestException(`This request was already ${conn.status}`);
    return this.prisma.roommateConnection.update({
      where: { id: connectionId },
      data: { status: "rejected" },
    });
  }

  async withdraw(connectionId: string, userId: string) {
    const conn = await this.prisma.roommateConnection.findUnique({
      where: { id: connectionId },
    });
    if (!conn) throw new NotFoundException("Connection not found");
    if (conn.requesterId !== userId)
      throw new ForbiddenException("Only the requester can withdraw");
    if (conn.status !== "pending")
      throw new BadRequestException(`This request was already ${conn.status}`);
    return this.prisma.roommateConnection.update({
      where: { id: connectionId },
      data: { status: "withdrawn" },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UniversityService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.university.findMany({ orderBy: { name: 'asc' } });
  }

  create(name: string) {
    return this.prisma.university.create({ data: { name: name.trim() } });
  }

  async update(id: string, name: string) {
    const university = await this.prisma.university.findUnique({ where: { id } });
    if (!university) throw new NotFoundException('University not found');
    return this.prisma.university.update({ where: { id }, data: { name: name.trim() } });
  }

  async remove(id: string) {
    const university = await this.prisma.university.findUnique({ where: { id } });
    if (!university) throw new NotFoundException('University not found');
    await this.prisma.university.delete({ where: { id } });
    return { id };
  }
}

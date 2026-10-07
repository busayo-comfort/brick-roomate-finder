import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeekerService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.seekerProfile.findUnique({ 
      where: { userId }, 
      include: { user: { select: { name: true } } } 
    });
    if (!profile) throw new NotFoundException('Seeker profile not found');
    const { user, ...profileData } = profile;
    return { ...profileData, name: user.name };
  }

  async updateProfile(userId: string, data: {
    name?: string;
    university?: string;
    hasApartment?: boolean;
    location?: string;
    budgetMin?: number;
    budgetMax?: number;
    moveInDate?: string;
    duration?: string;
    genderPreference?: string;
    occupation?: string;
    bio?: string;
    lifestyleTags?: string[];
    cleanliness?: string;
    sleepSchedule?: string;
    studyHabits?: string;
  }) {
    const { name, ...profileData } = data;
    return this.prisma.$transaction(async (transaction) => {
      if (name !== undefined) {
        await transaction.user.update({ 
          where: { id: userId }, 
          data: { name: name.trim() } 
        });
      }
      
      // Filter out undefined values for create
      const createData = Object.fromEntries(
        Object.entries(profileData).filter(([_, v]) => v !== undefined)
      );
      
      const profile = await transaction.seekerProfile.upsert({
        where: { userId },
        update: profileData,
        create: {
          userId,
          ...createData,
        } as any,
      });
      
      return { 
        ...profile, 
        name: name ?? (await transaction.user.findUnique({ 
          where: { id: userId }, 
          select: { name: true } 
        }))?.name 
      };
    });
  }
}
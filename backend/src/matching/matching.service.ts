import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SeekerWithProfile {
  id: string;
  name: string | null;
  image: string | null;
  seekerProfile: {
    university: string;
    hasApartment: boolean;
    budgetMin: number | null;
    budgetMax: number | null;
    moveInDate: Date | null;
    genderPreference: string | null;
    lifestyleTags: string[];
    bio: string | null;
  } | null;
}

const CONTRADICTORY_TAGS = [
  ['smoker', 'non-smoker'],
  ['early-bird', 'night-owl'],
  ['tidy', 'messy'],
];

function hasContradictoryTags(tagsA: string[], tagsB: string[]): boolean {
  return CONTRADICTORY_TAGS.some(
    ([a, b]) =>
      (tagsA.includes(a) && tagsB.includes(b)) ||
      (tagsA.includes(b) && tagsB.includes(a)),
  );
}

function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1; // both empty, no conflict
  const intersection = a.filter((tag) => b.includes(tag)).length;
  const union = new Set([...a, ...b]).size;
  return intersection / union;
}

function calculateScore(current: SeekerWithProfile, other: SeekerWithProfile): number {
  const my = current.seekerProfile;
  const their = other.seekerProfile;
  if (!my || !their) return 0;

  if (hasContradictoryTags(my.lifestyleTags, their.lifestyleTags)) return 0;

  let score = 0;

  // Budget overlap (30 pts)
  if (my.budgetMin != null && my.budgetMax != null && their.budgetMin != null && their.budgetMax != null) {
    const overlapMin = Math.max(my.budgetMin, their.budgetMin);
    const overlapMax = Math.min(my.budgetMax, their.budgetMax);
    if (overlapMin <= overlapMax) {
      const overlapRange = overlapMax - overlapMin;
      const myRange = my.budgetMax - my.budgetMin || 1;
      const theirRange = their.budgetMax - their.budgetMin || 1;
      const maxOverlap = Math.min(myRange, theirRange);
      score += 30 * (overlapRange / maxOverlap);
    }
  }

  // Lifestyle tags (25 pts)
  const jaccard = jaccardSimilarity(my.lifestyleTags, their.lifestyleTags);
  score += 25 * jaccard;

  // Complementary apartment status (15 pts)
  if (my.hasApartment !== their.hasApartment) {
    score += 15;
  } else {
    score += 7;
  }

  // Move-in date proximity (20 pts)
  if (my.moveInDate && their.moveInDate) {
    const diffDays = Math.abs(new Date(my.moveInDate).getTime() - new Date(their.moveInDate).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 30) score += 20;
    else if (diffDays <= 60) score += 10;
    else if (diffDays <= 90) score += 5;
  }

  // Gender preference (10 pts) – binary match
  const myPref = my.genderPreference;
  const theirPref = their.genderPreference;
  if (myPref && theirPref && myPref === theirPref) {
    score += 10;
  }

  return Math.min(score, 100);
}

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

  async findMatches(userId: string, page = 1, limit = 20) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { seekerProfile: true },
    });

    if (!currentUser || !currentUser.seekerProfile) {
      return { data: [], meta: { page, limit, total: 0 } };
    }

    // Get all other seekers from same university
    const allSeekers = await this.prisma.user.findMany({
      where: {
        userType: 'seeker',
        id: { not: userId },
        seekerProfile: {
          university: currentUser.seekerProfile.university,
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
        seekerProfile: {
          select: {
            university: true,
            hasApartment: true,
            budgetMin: true,
            budgetMax: true,
            moveInDate: true,
            genderPreference: true,
            lifestyleTags: true,
            bio: true,
          },
        },
      },
    });

    // Calculate scores
    const scored = allSeekers
      .map((other) => ({
        user: {
          id: other.id,
          name: other.name,
          image: other.image,
          university: other.seekerProfile?.university,
          hasApartment: other.seekerProfile?.hasApartment,
          budgetMin: other.seekerProfile?.budgetMin,
          budgetMax: other.seekerProfile?.budgetMax,
          moveInDate: other.seekerProfile?.moveInDate,
          lifestyleTags: other.seekerProfile?.lifestyleTags,
          genderPreference: other.seekerProfile?.genderPreference,
          bio: other.seekerProfile?.bio,
        },
        compatibilityScore: calculateScore(currentUser, other as SeekerWithProfile),
      }))
      .filter((match) => match.compatibilityScore >= 40)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    const total = scored.length;
    const start = (page - 1) * limit;
    const paginated = scored.slice(start, start + limit);

    return {
      data: paginated,
      meta: { page, limit, total },
    };
  }
}
Here’s the implementation plan for the new matching & social features. I’ll give you **exact code changes** for each feature, one by one. No frontend changes needed, but I’ll note what new endpoints the frontend can use.

---

## 1. Enhanced Matching Algorithm

**Goal:** Add cleanliness, sleep schedule, study habits to the compatibility score.

### 1.1 Update Prisma Schema

Add new fields to `SeekerProfile` in `prisma/schema.prisma`:

```prisma
model SeekerProfile {
  // ... existing fields ...
  cleanliness     String?   // "very-clean", "average", "messy"
  sleepSchedule   String?   // "early-bird", "night-owl", "flexible"
  studyHabits     String?   // "quiet", "group", "library", "any"
}
```

Run migration (you'll have to do it locally later; for now you can add the columns manually via Neon SQL Editor like before):

```sql
ALTER TABLE "SeekerProfile" ADD COLUMN "cleanliness" TEXT;
ALTER TABLE "SeekerProfile" ADD COLUMN "sleepSchedule" TEXT;
ALTER TABLE "SeekerProfile" ADD COLUMN "studyHabits" TEXT;
```

### 1.2 Update DTO (allow new fields)

Modify `src/seeker/dto/update-seeker.dto.ts`:

```ts
@IsOptional()
@IsString()
@IsIn(['very-clean', 'average', 'messy'])
cleanliness?: string;

@IsOptional()
@IsString()
@IsIn(['early-bird', 'night-owl', 'flexible'])
sleepSchedule?: string;

@IsOptional()
@IsString()
@IsIn(['quiet', 'group', 'library', 'any'])
studyHabits?: string;
```

### 1.3 Update Matching Service

In `src/matching/matching.service.ts`, modify `calculateScore` to add three new scoring factors (15 points each):

**Add after the existing gender block:**

```ts
// Cleanliness match (15 pts)
if (my.cleanliness && their.cleanliness && my.cleanliness === their.cleanliness) {
  score += 15;
}

// Sleep schedule compatibility (15 pts)
// Same schedule = full; flexible matches with anyone
if (my.sleepSchedule && their.sleepSchedule) {
  if (my.sleepSchedule === their.sleepSchedule) score += 15;
  else if (my.sleepSchedule === 'flexible' || their.sleepSchedule === 'flexible') score += 10;
}

// Study habits (15 pts)
if (my.studyHabits && their.studyHabits) {
  if (my.studyHabits === their.studyHabits) score += 15;
  else if (my.studyHabits === 'any' || their.studyHabits === 'any') score += 10;
}
```

**Adjust max total score** (now up to 100 + 45 = 145). You can either normalize or keep raw. For consistency, I’d keep it as raw but the frontend can show a percentage relative to max possible. Or we can cap at 100. I’ll cap the final score at 100 after adding all points to avoid confusion.

```ts
return Math.min(score, 100);
```

The `calculateScore` already does this. So just add the new points before the return.

### 1.4 Update SeekerService (optional)

Make sure the profile update can accept these new fields. Since `SeekerService.updateProfile` already spreads `data` into Prisma update, no change needed.

---

## 2. Profile Completeness Score

**Goal:** Return a percentage of how complete the seeker profile is.

### 2.1 Add a Method in SeekerService

In `src/seeker/seeker.service.ts`, add:

```ts
calculateCompleteness(profile: SeekerProfile): number {
  const fields = [
    profile.university,
    profile.budgetMin,
    profile.budgetMax,
    profile.moveInDate,
    profile.genderPreference,
    profile.cleanliness,
    profile.sleepSchedule,
    profile.studyHabits,
    profile.lifestyleTags?.length > 0,
    profile.bio,
  ];
  const filled = fields.filter(f => !!f).length;
  return Math.round((filled / fields.length) * 100);
}
```

Then update `getProfile` to return completeness:

```ts
async getProfile(userId: string) {
  const profile = await this.prisma.seekerProfile.findUnique({ where: { userId } });
  if (!profile) throw new NotFoundException('Seeker profile not found');
  return {
    ...profile,
    completeness: this.calculateCompleteness(profile),
  };
}
```

Now `GET /profile/seeker` will include `completeness` (number, 0-100). The frontend can show a progress bar.

---

## 3. Block Users

**Goal:** Prevent blocked users from appearing in matches or sending connections.

### 3.1 Add Block Model to Prisma

```prisma
model BlockedUser {
  id          String   @id @default(cuid())
  blockerId   String
  blockedId   String
  createdAt   DateTime @default(now())

  blocker     User     @relation("Blocker", fields: [blockerId], references: [id], onDelete: Cascade)
  blocked     User     @relation("Blocked", fields: [blockedId], references: [id], onDelete: Cascade)
}
```

Add to User model:

```prisma
model User {
  // ...
  blockedUsers       BlockedUser[] @relation("Blocker")
  blockedByUsers     BlockedUser[] @relation("Blocked")
}
```

Run migration manually in Neon SQL Editor:

```sql
CREATE TABLE "BlockedUser" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "blockerId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "blockedId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### 3.2 Create Block Module

Create `src/block/block.controller.ts`, `src/block/block.service.ts`, `src/block/block.module.ts`.

**block.service.ts:**

```ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BlockService {
  constructor(private prisma: PrismaService) {}

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) throw new BadRequestException('Cannot block yourself');
    const existing = await this.prisma.blockedUser.findFirst({
      where: { blockerId, blockedId },
    });
    if (!existing) {
      await this.prisma.blockedUser.create({ data: { blockerId, blockedId } });
    }
    return { success: true };
  }

  async unblockUser(blockerId: string, blockedId: string) {
    await this.prisma.blockedUser.deleteMany({
      where: { blockerId, blockedId },
    });
    return { success: true };
  }
}
```

**block.controller.ts:**

```ts
import { Controller, Post, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { BlockService } from './block.service';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post(':userId')
  @HttpCode(HttpStatus.OK)
  async blockUser(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.blockService.blockUser(user.id, userId);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  async unblockUser(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.blockService.unblockUser(user.id, userId);
  }
}
```

**block.module.ts:**

```ts
import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';

@Module({
  providers: [BlockService],
  controllers: [BlockController],
})
export class BlockModule {}
```

Register `BlockModule` in `app.module.ts`.

### 3.3 Exclude Blocked Users from Matches

In `src/matching/matching.service.ts`, inside `findMatches`, after fetching `allSeekers`, filter out users who are blocked by the current user or who blocked the current user:

```ts
// Get blocked user IDs
const blocked = await this.prisma.blockedUser.findMany({
  where: {
    OR: [
      { blockerId: userId },
      { blockedId: userId },
    ],
  },
  select: { blockerId: true, blockedId: true },
});
const blockedIds = new Set<string>();
blocked.forEach(b => {
  blockedIds.add(b.blockerId);
  blockedIds.add(b.blockedId);
});

// Then filter allSeekers
const filtered = allSeekers.filter(u => !blockedIds.has(u.id));
```

Then map and score `filtered` instead of `allSeekers`.

Also, in `ConnectionService.sendRequest`, check that the receiver is not blocked:

```ts
const block = await this.prisma.blockedUser.findFirst({
  where: {
    OR: [
      { blockerId: requesterId, blockedId: receiverId },
      { blockerId: receiverId, blockedId: requesterId },
    ],
  },
});
if (block) throw new BadRequestException('Cannot send request to this user');
```

---

## 4. Report Users

**Goal:** Let users report others for safety.

### 4.1 Add Report Model

```prisma
model Report {
  id          String   @id @default(cuid())
  reporterId  String
  reportedId  String
  reason      String
  createdAt   DateTime @default(now())

  reporter    User     @relation("Reporter", fields: [reporterId], references: [id], onDelete: Cascade)
  reported    User     @relation("Reported", fields: [reportedId], references: [id], onDelete: Cascade)
}
```

Manual SQL:

```sql
CREATE TABLE "Report" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "reporterId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "reportedId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Create Report Module

Create `src/report/` similar to block. `report.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}
  async create(reporterId: string, reportedId: string, reason: string) {
    return this.prisma.report.create({
      data: { reporterId, reportedId, reason },
    });
  }
}
```

`report.controller.ts`:

```ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ReportService } from './report.service';
import { CurrentUser } from '../decorators/current-user.decorator';

class CreateReportDto {
  reportedId: string;
  reason: string;
}

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: any, @Body() body: CreateReportDto) {
    return this.reportService.create(user.id, body.reportedId, body.reason);
  }
}
```

Register the module.

---

## 5. Mutual Acceptance – Reveal Contact Info

When a connection is accepted, we’ll allow the two users to see each other’s email.

Modify `ConnectionController` to add a `GET /connections/:id` endpoint that returns the other user’s email if status is `'accepted'` and the requester is one of the participants.

Add to `ConnectionService`:

```ts
async getConnection(connectionId: string, userId: string) {
  const conn = await this.prisma.roommateConnection.findUnique({
    where: { id: connectionId },
    include: {
      requester: { select: { id: true, name: true, image: true, email: true } },
      receiver: { select: { id: true, name: true, image: true, email: true } },
    },
  });
  if (!conn) throw new NotFoundException('Connection not found');
  if (conn.requesterId !== userId && conn.receiverId !== userId) throw new ForbiddenException();
  const other = conn.requesterId === userId ? conn.receiver : conn.requester;
  return {
    ...conn,
    otherUser: conn.status === 'accepted' ? other : { id: other.id, name: other.name, image: other.image },
  };
}
```

Add controller method:

```ts
@Get(':id')
async getConnection(@Param('id') id: string, @CurrentUser() user: any) {
  return this.connectionService.getConnection(id, user.id);
}
```

Now when a connection is accepted, the frontend can call this endpoint to show the other person's email.

---

## 6. Profile Photo Upload (Cloudinary)

### 6.1 Install packages

Add to `package.json`:

```json
"cloudinary": "^1.41.0",
"multer": "^1.4.5-lts.1"
```

Also `@types/multer` in devDependencies.

### 6.2 Configure Cloudinary

Add env vars:

```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Create `src/config/cloudinary.config.ts`:

```ts
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: 'Cloudinary',
  useFactory: (config: ConfigService) => {
    return cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  },
  inject: [ConfigService],
};
```

### 6.3 Create Upload Module

`src/upload/upload.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { CloudinaryProvider } from '../config/cloudinary.config';

@Module({
  providers: [UploadService, CloudinaryProvider],
  controllers: [UploadController],
})
export class UploadModule {}
```

`upload.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import cloudinary from 'cloudinary';

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        { folder: 'profile_photos' },
        (error, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      ).end(file.buffer);
    });
  }
}
```

`upload.controller.ts`:

```ts
import { Controller, Post, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('profile/photo')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    const url = await this.uploadService.uploadImage(file);
    await this.prisma.user.update({ where: { id: user.id }, data: { image: url } });
    return { url };
  }
}
```

Register `UploadModule` in AppModule.

---

## Summary

After implementing all these changes, the backend will support:

- Enhanced matching with cleanliness, sleep, study habits.
- Profile completeness score.
- Blocking/unblocking users (and filtering them from matches and connections).
- Reporting users.
- Seeing the other person's email when a connection is mutually accepted.
- Profile photo upload to Cloudinary.

You can hand the new endpoints to the frontend dev. Let me know if you need the exact final code files for any of these parts.
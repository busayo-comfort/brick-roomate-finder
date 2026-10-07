src/
├── auth/
│   ├── auth.config.ts              # Better Auth instance (email OTP only)
│   ├── auth.module.ts              # ForRoot registration
│   └── auth.controller.ts          # OTP request/verify + session endpoints
│
├── guards/
│   ├── auth.guard.ts               # Global deny-by-default guard
│   └── optional-auth.guard.ts      # Optional auth (returns null if no session)
│
├── decorators/
│   ├── allow-anonymous.decorator.ts
│   ├── session.decorator.ts        # Extracts full session
│   └── current-user.decorator.ts   # Extracts userId or user object
│
├── mail/
│   ├── mail.module.ts
│   ├── mail.service.ts             # sendOtpEmail via Resend
│   └── mail.service.interface.ts
│
├── config/
│   ├── env.validation.ts           # Validate required env vars at boot
│   └── configuration.ts            # Typed config loader
│
├── prisma/
│   ├── schema.prisma               # 4 models: User, Session, Account, Verification
│   ├── prisma.module.ts
│   └── prisma.service.ts
│
├── common/
│   └── rate-limit/
│       └── rate-limit.guard.ts     # Simple in‑memory per‑IP + per‑email limiter
│
├── app.module.ts
└── main.ts
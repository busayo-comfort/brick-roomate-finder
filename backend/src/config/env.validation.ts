import { Logger } from '@nestjs/common';

export function validateEnv() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'RESEND_API_KEY',
    'MAIL_FROM',
  ];
  for (const key of required) {
    if (!process.env[key]) {
      Logger.error(`Missing required env variable: ${key}`, 'EnvValidator');
      process.exit(1);
    }
  }
}
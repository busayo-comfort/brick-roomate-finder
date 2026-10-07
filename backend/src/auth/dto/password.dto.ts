import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class PasswordSignUpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak. Must contain uppercase, lowercase, and number/symbol.',
  })
  password!: string;
}

export class PasswordSignInDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class SetPasswordDto {
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak. Must contain uppercase, lowercase, and number/symbol.',
  })
  password!: string;
}
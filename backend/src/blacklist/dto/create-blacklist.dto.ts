import { IsNotEmpty } from 'class-validator';

export class CreateBlacklistDto {
  @IsNotEmpty()
  fullName!: string;

  @IsNotEmpty()
  nationalId!: string;

  @IsNotEmpty()
  phone!: string;

  @IsNotEmpty()
  reason!: string;
}
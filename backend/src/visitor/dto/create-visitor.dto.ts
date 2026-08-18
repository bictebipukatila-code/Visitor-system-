import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateVisitorDto {
  @IsNotEmpty()
  fullName!: string;

  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only numbers' })
  phone!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  address!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsNotEmpty()
  nationalId!: string;

  @IsNotEmpty()
  companyName!: string;

  @IsNotEmpty()
  purposeOfVisit!: string;

  @IsNotEmpty()
  department!: string;

  @IsNotEmpty()
  personToVisit!: string;

  @IsOptional()
  remarks?: string;
}
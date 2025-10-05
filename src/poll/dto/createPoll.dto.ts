import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export enum PollVisiblity {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

class OptionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  option: string;
}

export class CreatePollDto {
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];

  @IsEnum(PollVisiblity)
  @IsOptional()
  visibility?: PollVisiblity = PollVisiblity.PUBLIC;

  @ValidateIf((user) => user.visibility === PollVisiblity.PRIVATE)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedUsers?: string[];

  @IsDateString()
  expiresAt: string;
}

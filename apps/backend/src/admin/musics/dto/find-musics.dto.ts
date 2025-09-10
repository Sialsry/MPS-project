import {
  IsOptional, IsString, IsEnum, IsDateString, IsBoolean,
  IsInt, Min, Max, IsIn
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum SortField {
  TITLE = 'title',
  ARTIST = 'artist',
  GENRE = 'genre',
  MUSIC_TYPE = 'musicType',
  VALID_PLAYS = 'validPlays',
  VALID_RATE = 'validRate',
  REWARD = 'reward',
  CREATED_AT = 'createdAt',
  PLAYS = 'plays'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class FindMusicsDto {
  @IsOptional()
  @Type(() => Number)   // "1" -> 1
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)   // "10" -> 10
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  musicType?: string;

  @IsOptional()
  @IsString()
  idSortFilter?: '전체' | '오름차순' | '내림차순';

  @IsOptional()
  @IsString()
  releaseDateSortFilter?: '전체' | '오름차순' | '내림차순';

  @IsOptional()
  @IsString()
  rewardLimitFilter?: '전체' | '오름차순' | '내림차순';

  @IsOptional()
  @IsString()
  dateFilter?: '최신순' | '오래된순';

  @IsOptional()
  @IsEnum(SortField)
  sortBy: SortField = SortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => ( // "true"/"false"/1/0 처리
    value === true ||
    value === 'true' ||
    value === 1 ||
    value === '1'
  ))
  includeStats: boolean = false;

  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly', 'yearly'])
  statsType?: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

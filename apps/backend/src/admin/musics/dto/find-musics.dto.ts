import { IsOptional, IsString, IsEnum, IsDateString, IsBoolean } from 'class-validator';

export enum SortField {
  TITLE = 'title',
  ARTIST = 'artist',
  GENRE = 'genre',
  MUSIC_TYPE = 'musicType',
  VALID_PLAYS = 'validPlays',
  VALID_RATE = 'validRate',
  REWARD = 'reward',
  CREATED_AT = 'createdAt',
  PLAYS = 'plays',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FindMusicsDto {
  @IsOptional()
  page?: number = 1;   // 가드 제거

  @IsOptional()
  limit?: number = 10; // 가드 제거

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
  sortBy?: SortField = SortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsBoolean()
  includeStats?: boolean = false;

  @IsOptional()
  statsType?: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

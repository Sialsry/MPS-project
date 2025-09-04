import { IsNumber, Min } from 'class-validator';

export class UpdateRewardDto {
  @IsNumber()
  @Min(0)
  totalRewardCount!: number;

  @IsNumber()
  @Min(0)
  rewardPerPlay!: number;
} 
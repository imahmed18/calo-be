import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ description: 'Name or description of the job' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Category for the Unsplash image',
    default: 'food',
  })
  @IsString()
  @IsNotEmpty()
  category: string;
}

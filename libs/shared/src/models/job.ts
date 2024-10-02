import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '../enums/JobStatus';
import { ImageData } from '../types/const';

export class Job {
  @ApiProperty({ description: 'Unique identifier for the job' })
  id: string;

  @ApiProperty({ description: 'Name or description of the job' })
  name: string;

  @ApiProperty({ description: 'Category for the Unsplash image' })
  category: string;

  @ApiProperty({
    description: 'Current status of the job',
    type: () => JobStatus,
  })
  status: JobStatus;

  @ApiProperty({
    description: 'Data of the job execution, null if not yet completed',
    example: null,
  })
  data: ImageData | null;
}

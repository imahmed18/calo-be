import { CreateJobDto } from '@app/shared/dtos/jobs/create-job.dto';
import { JobServiceEvents } from '@app/shared/enums/events';
import { Job } from '@app/shared/models/job';
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('jobs')
export class JobController {
  constructor(@Inject('JOB_SERVICE') private jobService: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({ status: 200, description: 'Returns a list of all jobs' })
  async getAllJobs(): Promise<Job[]> {
    const jobResponse = await this.jobService
      .send({ cmd: JobServiceEvents.GetAllJobs }, {})
      .toPromise();

    return jobResponse;
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) // Validate the DTO
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({
    status: 201,
    description: 'The job has been successfully created',
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async createJob(@Body() payload: CreateJobDto): Promise<Job> {
    const jobResponse = await this.jobService
      .send({ cmd: JobServiceEvents.CreateJob }, payload)
      .toPromise();

    return jobResponse;
  }
}

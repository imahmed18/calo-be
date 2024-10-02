import { CreateJobDto } from '@app/shared/dtos/jobs/create-job.dto';
import { JobServiceEvents } from '@app/shared/enums/events';
import { Job } from '@app/shared/models/job';
import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('jobs')
export class JobController {
  private readonly logger = new Logger(JobController.name);
  constructor(@Inject('JOB_SERVICE') private jobService: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({ status: 200, description: 'Returns a list of all jobs' })
  async getAllJobs(): Promise<Job[]> {
    try {
      this.logger.log('Relaying fetch all jobs request to job-microservice');
      const jobResponse = await this.jobService
        .send({ cmd: JobServiceEvents.GetAllJobs }, {})
        .toPromise();

      this.logger.log(`Successfully fetched ${jobResponse.length} jobs`);
      return jobResponse;
    } catch (error) {
      this.logger.error('Failed to fetch jobs', error.stack);
      throw error;
    }
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
    try {
      this.logger.log(
        `Relaying create job request with name: ${payload.name} to job-microservice`,
      );
      const jobResponse = await this.jobService
        .send({ cmd: JobServiceEvents.CreateJob }, payload)
        .toPromise();

      this.logger.log(`Successfully created job with ID: ${jobResponse.id}`);
      return jobResponse;
    } catch (error) {
      this.logger.error('Failed to create job', error.stack);
      throw error;
    }
  }
}

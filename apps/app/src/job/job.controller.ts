import { CreateJobDto } from '@app/shared/dtos/jobs/create-job.dto';
import { JobServiceEvents } from '@app/shared/enums/events';
import { Job } from '@app/shared/models/job';
import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RpcToHttpExceptionFilter } from '../common/filters/rpc-to-http-exception.filter';
import { sendSynchronousMessage } from '@app/shared/utils';

@Controller('jobs')
@UseFilters(RpcToHttpExceptionFilter)
export class JobController {
  private readonly logger = new Logger(JobController.name);
  constructor(@Inject('JOB_SERVICE') private jobService: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({ status: 200, description: 'Returns a list of all jobs' })
  async getAllJobs(): Promise<Job[]> {
    try {
      this.logger.log('Relaying fetch all jobs request to job-microservice');
      const jobResponse = await sendSynchronousMessage(
        this.jobService.send({ cmd: JobServiceEvents.GetAllJobs }, {}),
      );

      this.logger.log(`Successfully fetched ${jobResponse.length} jobs`);
      return jobResponse;
    } catch (error) {
      this.logger.error('Failed to fetch jobs', error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the job with the specified ID',
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobById(@Param('id') id: string): Promise<Job> {
    try {
      this.logger.log(
        `Relaying fetch job request for ID: ${id} to job-microservice`,
      );
      const jobResponse = await sendSynchronousMessage(
        this.jobService.send(
          { cmd: JobServiceEvents.GetJobById },
          { jobId: id },
        ),
      );

      this.logger.log(`Successfully fetched job with ID: ${jobResponse.id}`);
      return jobResponse;
    } catch (error) {
      this.logger.error(`Failed to fetch job with id: ${id}`, error.stack);
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
      const jobResponse = await sendSynchronousMessage(
        this.jobService.send({ cmd: JobServiceEvents.CreateJob }, payload),
      );

      this.logger.log(`Successfully created job with ID: ${jobResponse.id}`);
      return jobResponse;
    } catch (error) {
      this.logger.error('Failed to create job', error.stack);
      throw error;
    }
  }
}

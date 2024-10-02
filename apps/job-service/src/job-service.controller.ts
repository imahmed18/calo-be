import { Controller, Logger } from '@nestjs/common';
import { JobServiceService } from './job-service.service';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CreateJobDto } from '@app/shared/dtos/jobs/create-job.dto';
import { Job } from '@app/shared/models/job';

@Controller()
export class JobServiceController {
  private readonly logger = new Logger(JobServiceController.name);
  constructor(private readonly jobServiceService: JobServiceService) {}

  @MessagePattern({ cmd: 'get-all-jobs' })
  async getAllJobs(@Ctx() context: RmqContext): Promise<Job[]> {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
    this.logger.log('Retrieving all jobs');
    return this.jobServiceService.getAllJobs();
  }

  @MessagePattern({ cmd: 'create-job' })
  async createJob(
    @Ctx() context: RmqContext,
    @Payload() payload: CreateJobDto,
  ): Promise<Job> {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
    this.logger.log(
      `Creating job with name: ${payload.name}, category: ${payload.category}`,
    );
    return await this.jobServiceService.createJob(payload);
  }

  @EventPattern('job-updated')
  async updateJob(@Payload() updatedJob: Job) {
    this.logger.log(`Updating job with ID: ${updatedJob.id}`);
    this.jobServiceService.updateJobWithImage(updatedJob);
  }
}

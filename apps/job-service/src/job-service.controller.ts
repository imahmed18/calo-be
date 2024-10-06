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
import { JobServiceEvents } from '@app/shared/enums/events';
import {
  acknowledgeMessage,
  rejectMessageOrSendToDLQ,
} from '@app/shared/utils';

@Controller()
export class JobServiceController {
  private readonly logger = new Logger(JobServiceController.name);
  constructor(private readonly jobServiceService: JobServiceService) {}

  @MessagePattern({ cmd: JobServiceEvents.GetAllJobs })
  async getAllJobs(@Ctx() context: RmqContext): Promise<Job[]> {
    try {
      this.logger.log(
        `${JobServiceEvents.GetAllJobs} event received: Fetching all jobs`,
      );
      const response = this.jobServiceService.getAllJobs();
      acknowledgeMessage(context);
      return response;
    } catch (error) {
      rejectMessageOrSendToDLQ(context);
      throw error;
    }
  }

  @MessagePattern({ cmd: JobServiceEvents.GetJobById })
  async getJobById(
    @Ctx() context: RmqContext,
    @Payload() payload: { jobId: string },
  ): Promise<Job> {
    try {
      this.logger.log(
        `${JobServiceEvents.GetJobById} event received: Fetching job with id: ${payload.jobId}`,
      );
      const response = this.jobServiceService.getJobById(payload.jobId);
      acknowledgeMessage(context);
      return response;
    } catch (error) {
      rejectMessageOrSendToDLQ(context);
      throw error;
    }
  }

  @MessagePattern({ cmd: JobServiceEvents.CreateJob })
  async createJob(
    @Ctx() context: RmqContext,
    @Payload() payload: CreateJobDto,
  ): Promise<Job> {
    try {
      this.logger.log(
        `${JobServiceEvents.CreateJob} event received: Creating job with name: ${payload.name}`,
      );
      const response = await this.jobServiceService.createJob(payload);
      acknowledgeMessage(context);
      return response;
    } catch (error) {
      rejectMessageOrSendToDLQ(context);
      throw error;
    }
  }

  @EventPattern(JobServiceEvents.UpdateJob)
  async updateJob(@Ctx() context: RmqContext, @Payload() updatedJob: Job) {
    try {
      this.logger.log(
        `${JobServiceEvents.UpdateJob} event received: Updating job with ID: ${updatedJob.id}`,
      );
      this.jobServiceService.updateJobWithImage(updatedJob);
      acknowledgeMessage(context);
    } catch (error) {
      rejectMessageOrSendToDLQ(context);
      throw error;
    }
  }
}

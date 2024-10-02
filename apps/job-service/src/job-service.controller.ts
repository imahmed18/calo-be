import { Controller } from '@nestjs/common';
import { JobServiceService } from './job-service.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CreateJobDto } from '@app/shared/dtos/jobs/create-job.dto';
import { Job } from '@app/shared/models/job';

@Controller()
export class JobServiceController {
  constructor(private readonly jobServiceService: JobServiceService) {}

  @MessagePattern({ cmd: 'get-all-jobs' })
  async getAllJobs(@Ctx() context: RmqContext): Promise<Job[]> {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
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
    return await this.jobServiceService.createJob(payload);
  }
}

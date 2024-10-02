import { Controller, Get } from '@nestjs/common';
import { JobServiceService } from './job-service.service';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';

@Controller()
export class JobServiceController {
  constructor(private readonly jobServiceService: JobServiceService) {}

  @Get()
  getHello(): string {
    return this.jobServiceService.getHello();
  }

  @MessagePattern({ cmd: 'get-all-jobs' })
  async getAllJobs(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);

    return { jobs: 'JOB' };
  }
}

import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(@Inject('JOB_SERVICE') private jobService: ClientProxy) {}

  @Get()
  async getAllJobs() {
    return this.jobService.send(
      {
        cmd: 'get-all-jobs',
      },
      {},
    );
  }
}

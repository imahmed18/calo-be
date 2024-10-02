import { Test, TestingModule } from '@nestjs/testing';
import { JobServiceController } from './job-service.controller';
import { JobServiceService } from './job-service.service';

describe('JobServiceController', () => {
  let jobServiceController: JobServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [JobServiceController],
      providers: [JobServiceService],
    }).compile();

    jobServiceController = app.get<JobServiceController>(JobServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(jobServiceController.getHello()).toBe('Hello World!');
    });
  });
});

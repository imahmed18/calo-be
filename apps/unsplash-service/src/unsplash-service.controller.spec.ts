import { Test, TestingModule } from '@nestjs/testing';
import { UnsplashServiceController } from './unsplash-service.controller';
import { UnsplashServiceService } from './unsplash-service.service';

describe('UnsplashServiceController', () => {
  let unsplashServiceController: UnsplashServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UnsplashServiceController],
      providers: [UnsplashServiceService],
    }).compile();

    unsplashServiceController = app.get<UnsplashServiceController>(UnsplashServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(unsplashServiceController.getHello()).toBe('Hello World!');
    });
  });
});

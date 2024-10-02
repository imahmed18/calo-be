import { Module } from '@nestjs/common';
import { UnsplashServiceController } from './unsplash-service.controller';
import { UnsplashServiceService } from './unsplash-service.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
  ],
  controllers: [UnsplashServiceController],
  providers: [UnsplashServiceService],
})
export class UnsplashServiceModule {}

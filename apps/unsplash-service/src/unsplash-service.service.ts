import { Injectable } from '@nestjs/common';

@Injectable()
export class UnsplashServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}

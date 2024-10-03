import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom, map, retry, tap } from 'rxjs';

@Injectable()
export class SharedService {
  private readonly logger = new Logger(SharedService.name);
  constructor(private readonly httpService: HttpService) {}

  async makeApiRequest(
    reqType: 'GET' | 'POST' | 'PUT',
    endpoint: string,
    headers: any,
    body: any = {},
  ) {
    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const requestObservable = this.getRequestObservable(
      reqType,
      endpoint,
      requestOptions,
      body,
    );

    const res = await lastValueFrom(
      requestObservable.pipe(
        tap({
          error: () =>
            this.logger.log(
              `Retrying ${reqType} request with endpoint: ${endpoint}`,
            ),
        }),
        retry({
          count: 3,
          delay: 47000, // 47000 milliseconds = 47 seconds back off time
        }),
        map((res) => ({ status: res.status, data: res.data })),
      ),
    );

    return res;
  }

  private getRequestObservable(
    reqType: 'GET' | 'POST' | 'PUT',
    endpoint: string,
    requestOptions: any,
    body: any,
  ) {
    switch (reqType) {
      case 'GET':
        return this.httpService.get(endpoint, requestOptions);
      case 'POST':
        return this.httpService.post(
          endpoint,
          JSON.stringify(body),
          requestOptions,
        );
      case 'PUT':
        return this.httpService.put(
          endpoint,
          JSON.stringify(body),
          requestOptions,
        );
      default:
        throw new Error(`Unsupported request type: ${reqType}`);
    }
  }
}

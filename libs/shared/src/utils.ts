import { RequestTimeoutException } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { catchError, firstValueFrom, Observable, timeout } from 'rxjs';

export function acknowledgeMessage(context: RmqContext) {
  const channel = context.getChannelRef();
  const message = context.getMessage();
  channel.ack(message);
}

export async function sendSynchronousMessage(observable: Observable<any>) {
  return await firstValueFrom(
    observable.pipe(
      timeout(30000),
      catchError(() => {
        throw new RequestTimeoutException('Request timed out or failed');
      }),
    ),
  );
}

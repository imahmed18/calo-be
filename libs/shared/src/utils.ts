import { RequestTimeoutException } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { catchError, firstValueFrom, Observable, timeout } from 'rxjs';

export function acknowledgeMessage(context: RmqContext) {
  const channel = context.getChannelRef();
  const message = context.getMessage();
  channel.ack(message);
}

export function rejectMessageOrSendToDLQ(context: RmqContext) {
  const channel = context.getChannelRef();
  const message = context.getMessage();
  const isRetryingMessage = message.fields.redelivered;
  if (isRetryingMessage) {
    channel.nack(message, false, false); // if a message is already retried, send it to dlq
  } else {
    channel.nack(message, false, true); // if a message fails for the first time, requeue it
  }
}

export async function getFirstValueOrThrowTimeout(observable: Observable<any>) {
  return await firstValueFrom(
    observable.pipe(
      timeout(30000),
      catchError(() => {
        throw new RequestTimeoutException('Request timed out or failed');
      }),
    ),
  );
}

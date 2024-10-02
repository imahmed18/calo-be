import { RmqContext } from '@nestjs/microservices';

export function acknowledgeMessage(context: RmqContext) {
  const channel = context.getChannelRef();
  const message = context.getMessage();
  channel.ack(message);
}

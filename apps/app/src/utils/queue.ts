import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

export async function initializeDLQ(configService: ConfigService) {
  const USER = configService.get('RABBITMQ_USER');
  const PASSWORD = configService.get('RABBITMQ_PASS');
  const HOST = configService.get('RABBITMQ_HOST');
  const DLQ = configService.get('RABBITMQ_DLQ_QUEUE');

  const MAX_RETRIES = 10; // maximum number of retry attempts
  const RETRY_DELAY = 3000; // delay in milliseconds

  let channel = null;
  let connection = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      connection = await amqp.connect(`amqp://${USER}:${PASSWORD}@${HOST}`);
      channel = await connection.createChannel();
      await channel.assertQueue(DLQ);
      console.log(
        `Successfully connected to RabbitMQ and initialized DLQ: ${DLQ}`,
      );
      return; // exit if successful
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed: ${error.message}`);
      if (attempt < MAX_RETRIES - 1) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY)); // wait before retrying
      } else {
        console.error('Max retries reached. Could not connect to RabbitMQ.');
      }
    }
  }
}

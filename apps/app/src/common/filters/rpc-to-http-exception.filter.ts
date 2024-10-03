import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // if exception is already an instance of HTTPException then just let it pass through
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      return response.status(status).json({
        ...((typeof exceptionResponse === 'object' && exceptionResponse) || {
          statusCode: status,
          message: exception.message,
        }),
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Check if the exception is from the RPC and contains `status` and `message`
    const status =
      exception?.status && typeof exception.status === 'number'
        ? exception.status
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception?.message || 'Internal server error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}

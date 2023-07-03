import {CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WebSocketValidationException } from './validation/web-socket-validation.exception';
import { WebSocketClient } from './web-socket-client.interface';

@Injectable()
export class WebSocketErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(WebSocketErrorInterceptor.name);

  public intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const socket = context.switchToWs().getClient() as WebSocketClient;

    if (socket) {
      return next.handle().pipe(
        catchError(error => {
          if (error instanceof WebSocketValidationException) {
            return of({
              event: error.event,
              data: {
                error: error.errors,
              },
            });
          }

          this.logger.error('unhandled error', { error });

          return of({
            event: 'error',
            data: {
              reason: 'interval-server-error',
            },
          });
        })
      );
    }

    return next.handle();
  }
}

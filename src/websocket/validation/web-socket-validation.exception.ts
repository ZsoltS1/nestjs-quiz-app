import { WsException } from '@nestjs/websockets';

export class WebSocketValidationException extends WsException {
  constructor(public readonly event?: string, public readonly errors?: any) {
    super('InvalidMessage');
  }
}

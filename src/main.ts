import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {WsAdapter} from "@nestjs/platform-ws";

async function bootstrap() {
    const config = require(`${process.cwd()}/config/config.json`);

    const app = await NestFactory.create(AppModule);

    app.useWebSocketAdapter(new WsAdapter(app));
    app.enableCors({
        origin: true,
        credentials: true,
        exposedHeaders: ['x-count', 'x-total-count', 'x-token'],
    });

    const port = process.env.PORT || config.port;
    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();

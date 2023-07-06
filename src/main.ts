import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {WsAdapter} from "@nestjs/platform-ws";
import * as fs from "fs";

async function bootstrap() {
    const config = require(`${process.cwd()}/config/config.json`);

    const httpsOptions = {
        key: fs.readFileSync(config.secretPrivatePath),
        cert: fs.readFileSync(config.certificatePath),
    };

    const app = await NestFactory.create(AppModule, {
        httpsOptions,
    });

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

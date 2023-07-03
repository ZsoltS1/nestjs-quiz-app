import * as ws from 'ws';
import {UserModel} from "../model/user/user.model";

export interface WebSocketClient extends ws.WebSocket {
    user?: {
        model: UserModel
    };
}

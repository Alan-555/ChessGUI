import { WebSocketServer, WebSocket } from 'ws';
import Config from './app';
import { GetServerMove, Message, MessageStateSync, MessageType } from './protocolTypes';
import { StockfishInterface } from './sf';
import { TableSession } from './tableContext';

interface ClientConnection {
    clientID : string,
    socket : WebSocket,
    tableSession? : TableSession
}

class WebSocketSingleton {
    private static instance: WebSocketSingleton;
    private wss: WebSocketServer;
    private clients: { [clientID: string]: ClientConnection } = {};

    private constructor(port: number) {
        this.wss = new WebSocketServer({ port });
        this.wss.on('connection', (ws: WebSocket) => {
            ws.on('message', (message: string) => {
                let data : Message = JSON.parse(message);
                if(data.type==MessageType.REG_SEND){
                    this.clients[data.clientID] = {
                        clientID: data.clientID,
                        socket: ws,
                    };
                    this.SendMessageTo(data.clientID,{
                        type: MessageType.REG_ACKNOWLEDGE,
                        data: null
                    });
                    return;
                }
                // Handle incoming messages
                this.ReceiveMessage(data);
                console.log(`Received: ${message}`);
            });
        });
        console.log(`WebSocket server started on port ${port}`);
    }

    public static GetInstance(): WebSocketSingleton {
        if (!WebSocketSingleton.instance) {
            WebSocketSingleton.instance = new WebSocketSingleton(Config.port);
        }
        return WebSocketSingleton.instance;
    }

    public async ReceiveMessage(data : Message){
        const socket = this.clients[data.clientID].socket;
        
        if(data.type==MessageType.INIT_HOST_START){
            const ts = new TableSession(data.data);
            await ts.sfInterface.Init();
            await ts.sfInterface.setPosition(data.data.boardFen);
            this.clients[data.clientID].tableSession = ts;

            this.SendMessageTo(data.clientID, {
                type: MessageType.INIT_GO,
                data: null
            });
            return;
        }


        const session = this.clients[data.clientID].tableSession!;
        if(data.type==MessageType.SYNC_REQUEST){
            let ans : MessageStateSync = {...session.state, 
                boardFen : await session.sfInterface.getFen(),
                legalMoves: await session.sfInterface.getAllLegalMoves()
            }
            this.SendMessageTo(data.clientID, {
                type: MessageType.SYNC,
                data: ans
            })
        }
        else if(data.type == MessageType.MOVE){
            session.moves.push(GetServerMove(data.data));
            session.sfInterface.setPosition(session.state.boardFen,session.moves);
        }
    }

    public SendMessageTo(clientID : string, message : Omit<Message, "clientID">){
        this.clients[clientID].socket.send(JSON.stringify(message));
    }

    public SendMessage(data: string) {
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }
}

export default WebSocketSingleton;
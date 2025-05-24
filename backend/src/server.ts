import { WebSocketServer, WebSocket } from 'ws';
import Config from './app';
import { GetServerMove, Message, MessageStateSync, MessageType, OtherColor, PieceColor } from './protocolTypes';
import { StockfishInterface } from './sf';
import { TableSession } from './tableContext';


class Connection {

    public static connections: { [clientID: string]: Connection } = {};
    public static waitingTables: { [gameID: string]: TableSession } = {};

    private tableSession_?: TableSession;

    public isHost = false;

    public get tableSession() {
        return this.tableSession_;
    }

    private set tableSession(val) {
        this.tableSession_ = val;
    }

    public SetTableSession(val: TableSession) {
        this.tableSession_ = val;
        Connection.waitingTables[val.gameID] = val;

    }

    public GetOpponentSocket(): WebSocket | undefined {
        if (!this.tableSession_) return undefined;
        const { tableHost, tableClient } = this.tableSession_;
        return this.isHost ? (tableClient.socket as any) : (tableHost.socket as any);
    }
    public GetPlayer(){
        return this.isHost ? this.tableSession_?.tableHost : this.tableSession_?.tableClient;
    }

    public Dispose() {
        if (this.tableSession_)
            delete Connection.waitingTables[this.tableSession_.gameID];
        this.tableSession_?.dispose();
    }


}

function NewTableID(digits: number = 4) {
    let id: string = "";
    do {
        id = Math.floor(Math.random() * Math.pow(10, digits)).toString().padStart(digits, '0');
        if (!(id in Connection.waitingTables)) {
            return id;
        }
    }
    while (true)
}

export type Player = { color: PieceColor, socket: "STOCKFISH" | "NOT_PRESENT" | WebSocket }

class WebSocketSingleton {
    private static instance: WebSocketSingleton;
    private wss: WebSocketServer;


    private constructor(port: number) {
        this.wss = new WebSocketServer({ port });
        this.wss.on('connection', (ws: WebSocket) => {
            ws.on('message', (message: string) => {
                let data: Message = JSON.parse(message);
                if (data.type == MessageType.REG_SEND) {
                    let conn = new Connection();
                    Connection.connections[data.clientID] = conn;
                    this.SendMessageTo(ws, {
                        type: MessageType.REG_ACKNOWLEDGE,
                        data: null
                    });
                    return;
                }
                // Handle incoming messages
                this.ReceiveMessage(data, ws);
                console.log(`Received: ${message}`);
            });
            ws.on("close", (code, reason) => {
                console.log("Closing connection form " + code + " reason: " + reason);
                for (const client in Connection.connections) {
                    const connection = Connection.connections[client];
                    if(connection.GetPlayer()?.socket!=ws) continue;
                    let other = connection.GetOpponentSocket();
                    connection.Dispose();
                    delete Connection.connections[client];
                    if (other){
                        this.SendMessageTo(other, {
                            type: MessageType.GAME_RESIGN,
                            data: null
                        });
                        other.close();
                    }
                    break;

                }

            })
        });

        console.log(`WebSocket server started on port ${port}`);
    }

    public static GetInstance(): WebSocketSingleton {
        if (!WebSocketSingleton.instance) {
            WebSocketSingleton.instance = new WebSocketSingleton(Config.port);
        }
        return WebSocketSingleton.instance;
    }

    public async ReceiveMessage(data: Message, socket: WebSocket) {
        const conn = Connection.connections[data.clientID];
        const Reply = (message: Omit<Message, "clientID">) => {
            this.SendMessageTo(socket, message);
        }
        if (data.type == MessageType.INIT_HOST_START) {
            const ts = new TableSession(data.data, { color: data.data.youAre, socket: socket }, NewTableID(), { color: OtherColor(data.data.youAre), socket: "NOT_PRESENT" });
            ts.state.playerToMove = "white";
            await ts.sfInterface.Init();
            await ts.sfInterface.setPosition(data.data.boardFen);
            conn.SetTableSession(ts);
            conn.isHost = true;
            Reply({
                type: MessageType.INIT_HOST_WAIT,
                data: ts.gameID
            });
            return;
        }
        else if (data.type == MessageType.INIT_CLIENT_START) {
            let gameID = data.data.gameID;
            const ses = Connection.waitingTables[gameID];
            if (!ses) {
                Reply({
                    type: MessageType.CLIENT_ERROR,
                    data: {
                        errType: 'INVALID_ID'
                    }
                })
                return;
            }
            const table = Connection.waitingTables[gameID];
            delete Connection.waitingTables[gameID];
            conn.SetTableSession(table);
            table.tableClient = {
                color: table.tableClient.color,
                socket: socket
            }
            Reply({
                type: MessageType.INIT_GO,
                data: null
            });

            this.SendMessageTo(table.tableHost.socket as any, {
                type: MessageType.INIT_GO,
                data: null
            });
            return;


        }


        const tableSession = Connection.connections[data.clientID].tableSession!;
        if (data.type == MessageType.SYNC_REQUEST) {
            this.SendStateTo(conn.GetPlayer()!.color,tableSession,socket);
        }
        else if (data.type == MessageType.MOVE) {
            //TODO: validate move
            tableSession.moves.push(    GetServerMove(data.data));
            tableSession.sfInterface.setPosition(tableSession.state.boardFen, tableSession.moves);
            tableSession.state.playerToMove = OtherColor(tableSession.state.playerToMove);

            this.SendStateTo(conn.GetPlayer()!.color,tableSession,socket);
            this.SendStateTo(OtherColor(conn.GetPlayer()!.color!),tableSession,conn.GetOpponentSocket()!)
        }
        else if (data.type == MessageType.CHAT) {
            let enemySoc = conn.GetOpponentSocket();
            if (enemySoc)
                this.SendMessageTo(enemySoc, {
                    type: MessageType.CHAT,
                    data: data.data
                });
        }
    }

    public async SendStateTo(color : PieceColor,tableSession : TableSession , socket : WebSocket){
        let ans: MessageStateSync = {
                ...tableSession!.state,
                boardFen: await tableSession.sfInterface.getFen(),
                legalMoves: await tableSession.sfInterface.getAllLegalMoves(),
                youAre: color
            }
            this.SendMessageTo(socket,{
                type: MessageType.SYNC,
                data: ans
            })
    }

    public SendMessageTo(socket: WebSocket, message: Omit<Message, "clientID">) {
        socket.send(JSON.stringify(message));
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
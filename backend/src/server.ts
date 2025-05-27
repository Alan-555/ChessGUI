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
        if (val.gameID)
            Connection.waitingTables[val.gameID] = val;

    }

    public GetOpponentSocket(): WebSocket | undefined {
        if (!this.tableSession_) return undefined;
        const { tableHost, tableClient } = this.tableSession_;
        const socket = this.isHost ? (tableClient.socket) : (tableHost.socket);
        if (typeof socket == "object")
            return socket;
        return undefined;
    }
    public GetPlayer() {
        return this.isHost ? this.tableSession_?.tableHost : this.tableSession_?.tableClient;
    }

    public Dispose() {
        if (this.tableSession_ && this.tableSession_.gameID)
            delete Connection.waitingTables[this.tableSession_.gameID];
        this.tableSession_?.dispose();
    }

    public CloseTable(reason: string, serverIssued: boolean) {
        let other = this.GetOpponentSocket();
        if (other) {
            WebSocketSingleton.GetInstance().SendMessageTo(other, {
                type: MessageType.CHAT,
                data: {
                    isServerMessage: true,
                    message: `Game terminated - ${reason}`
                }
            });
            if (!serverIssued)
                WebSocketSingleton.GetInstance().SendMessageTo(other, {
                    type: MessageType.GAME_RESIGN,
                    data: null
                });
        }
        let thisSocket = this.GetPlayer()?.socket;
        if (typeof thisSocket == "object") {
            WebSocketSingleton.GetInstance().SendMessageTo(thisSocket, {
                type: MessageType.CHAT,
                data: {
                    isServerMessage: true,
                    message: `Game terminated - ${reason}`
                }
            });
            if (!serverIssued)
                WebSocketSingleton.GetInstance().SendMessageTo(thisSocket, {
                    type: MessageType.GAME_RESIGN,
                    data: null
                });
        }
        let stop = 0;
        for (const clientID in Connection.connections) {
            const connection = Connection.connections[clientID];
            const playerSocket = connection.GetPlayer()?.socket;
            if (playerSocket === thisSocket || playerSocket === other) {
                delete Connection.connections[clientID];
                if (typeof playerSocket == "object" && playerSocket.readyState === WebSocket.OPEN)
                    playerSocket.close(1000, reason); //normal closure
                if (stop++ > 0) break;
            }
        }
        this.Dispose();
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
                console.log("Closing connection for a client reason: " + reason);
                for (const client in Connection.connections) {
                    const connection = Connection.connections[client];
                    if (connection.GetPlayer()?.socket != ws) continue;
                    connection.CloseTable("Connection was closed by remote client (" + reason + ")", false);
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
        if (!conn) {
            socket.close(1000, "Not registered! Probably LATE_LEAVE");
        }
        const Reply = (message: Omit<Message, "clientID">) => {
            this.SendMessageTo(socket, message);
        }
        if (data.type == MessageType.INIT_HOST_START || data.type == MessageType.INIT_HOST_VS_AI_START) {
            const verifyResult = this.VerifyFen(data.data.boardFen, data.data.youAre);
            if (verifyResult !== undefined) {
                Reply({
                    type: MessageType.CLIENT_ERROR,
                    data: {
                        errType: 'INVALID_FEN',
                        message: verifyResult
                    } as any
                });
                return;
            }
            const isAi = data.type == MessageType.INIT_HOST_VS_AI_START;
            const ts = new TableSession(data.data, { color: data.data.youAre, socket: socket }, isAi ? undefined : NewTableID(), (code) => { conn.CloseTable("A server error has occurred. Game terminated. (stockfish stop code " + code + ")", true); }, { color: OtherColor(data.data.youAre), socket: "NOT_PRESENT" });
            ts.state.playerToMove = data.data.boardFen.split(' ')[1].toLowerCase() == 'w' ? "white" : "black";
            await ts.sfInterface.Init();
            await ts.sfInterface.setPosition(data.data.boardFen);
            conn.SetTableSession(ts);
            conn.isHost = true;
            if (!isAi)
                Reply({
                    type: MessageType.INIT_HOST_WAIT,
                    data: ts.gameID
                });
            else {
                ts.sfInterface.setDifficulty(data.data.sfDifficulty!.toString());
                ts.tableClient.socket = "STOCKFISH";
                ts.tableClient.color = OtherColor(data.data.youAre);
                Reply({
                    type: MessageType.INIT_GO,
                    data: null
                });
                if (ts.state.playerToMove == ts.tableClient.color) {
                    const move = await ts.sfInterface.getBestMove();
                    ts.moves.push(move);
                    ts.sfInterface.setPosition(ts.state.boardFen, ts.moves);
                    ts.state.playerToMove = OtherColor(ts.state.playerToMove);
                    this.SendStateTo(conn.GetPlayer()!.color, ts, socket);
                }
            }

            return;
        }
        else if (data.type == MessageType.INIT_CLIENT_START) {
            let gameID = data.data.gameID;
            const ses = Connection.waitingTables[gameID];
            if (!ses) {
                Reply({
                    type: MessageType.CLIENT_ERROR,
                    data: {
                        errType: 'INVALID_ID',
                        message: "The game does not exist!"
                    } as any
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

            await new Promise(resolve => setTimeout(resolve, 1000));
            Reply({
                type: MessageType.CHAT,
                data: {
                    isServerMessage: true,
                    message: "You are connected! You play as " + table.tableClient.color
                }
            });

            this.SendMessageTo(table.tableHost.socket as any, {
                type: MessageType.INIT_GO,
                data: null
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.SendMessageTo(table.tableHost.socket as any, {
                type: MessageType.CHAT,
                data: {
                    isServerMessage: true,
                    message: "Opponent connected!"
                }
            });
            return;


        }

        if (!Connection.connections[data.clientID]) {
            conn.CloseTable("Session already closed! (LATE_LEAVE)", true);
        }
        const tableSession = Connection.connections[data.clientID].tableSession!;
        if (data.type == MessageType.SYNC_REQUEST) {
            this.SendStateTo(conn.GetPlayer()!.color, tableSession, socket);
        }
        else if (data.type == MessageType.MOVE) {
            //TODO: validate move
            if (conn.GetPlayer()?.color != tableSession.state.playerToMove) return;
            const move = GetServerMove(data.data);
            if (!tableSession.state.legalMoves?.includes(move)) {
                Reply({
                    type: MessageType.CLIENT_ERROR,
                    data: {
                        errType:'ILLEGAL_MOVE'
                    }
                });
                return;
            }
            tableSession.moves.push(move);
            tableSession.sfInterface.setPosition(tableSession.state.boardFen, tableSession.moves);
            tableSession.state.playerToMove = OtherColor(tableSession.state.playerToMove);
            if (await this.CheckForGameEnd(conn, tableSession)) return;
            if (tableSession.tableClient.socket == "STOCKFISH") {
                const move = await tableSession.sfInterface.getBestMove();
                tableSession.moves.push(move);
                tableSession.sfInterface.setPosition(tableSession.state.boardFen, tableSession.moves);
                tableSession.state.playerToMove = OtherColor(tableSession.state.playerToMove);
                await this.SendStateTo(conn.GetPlayer()!.color, tableSession, socket);
                await this.CheckForGameEnd(conn, tableSession);
                return;
            }
            else {
                this.SendStateTo(OtherColor(conn.GetPlayer()!.color!), tableSession, conn.GetOpponentSocket()!)
            }
            this.SendStateTo(conn.GetPlayer()!.color, tableSession, socket);

        }
        else if (data.type == MessageType.CHAT) {
            let enemySoc = conn.GetOpponentSocket();
            if (enemySoc)
                this.SendMessageTo(enemySoc, {
                    type: MessageType.CHAT,
                    data: { ...data.data, isServerMessage: false }
                });
        }
    }

    public async SendStateTo(color: PieceColor, tableSession: TableSession, socket: WebSocket) {
        tableSession.state.legalMoves = await tableSession.sfInterface.getAllLegalMoves();
        let ans: MessageStateSync = {
            ...tableSession!.state,
            boardFen: await tableSession.sfInterface.getFen(),
            youAre: color,
            isInCheck: await tableSession.sfInterface.isInCheck(),
            blackTime: tableSession.state.gameStartTimestamp ? tableSession.state.maxTime! - (Date.now() - tableSession.state.gameStartTimestamp) : 0,
            whiteTime: tableSession.state.gameStartTimestamp ? tableSession.state.maxTime! - (Date.now() - tableSession.state.gameStartTimestamp) : 0
        }
        this.SendMessageTo(socket, {
            type: MessageType.SYNC,
            data: ans
        })
    }


    public async CheckForGameEnd(conn: Connection, tableSession: TableSession): Promise<boolean> {
        const legalMoves = await tableSession.sfInterface.getAllLegalMoves();
        const isInCheck = await tableSession.sfInterface.isInCheck();
        if (legalMoves!.length == 0) {
            //playerToMove is checkmated
            const reason = isInCheck ? "CHECKMATE" : "STALEMATE";
            this.SendMessageTo(tableSession.tableClient.socket, {
                type: MessageType.GAME_OVER,
                data: {
                    reason: reason,
                    winner: isInCheck ? OtherColor(tableSession.state.playerToMove) : null
                }
            });
            this.SendMessageTo(tableSession.tableHost.socket, {
                type: MessageType.GAME_OVER,
                data: {
                    reason: reason,
                    winner: isInCheck ? OtherColor(tableSession.state.playerToMove) : null
                }
            });
            if (isInCheck)
                conn.CloseTable("Game concluded by checkmate", true);
            else
                conn.CloseTable("Game concluded by stalemate", true);
            return true;
        }
        return false;
    }

    public SendMessageTo(socket: WebSocket | string, message: Omit<Message, "clientID">) {
        if (typeof socket === "string") return;
        socket.send?.(JSON.stringify(message));
    }

    public SendMessage(data: string) {
        this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }

    public VerifyFen(fen: string, first: PieceColor): string | undefined {
        // Basic validation of FEN string
        const fenParts = fen.split(' ');
        if (fenParts.length !== 6) return "Invalid FEN format";

        const [position, activeColor, castling, enPassant, halfMove, fullMove] = fenParts;

        // Validate position
        const rows = position.split('/');
        if (rows.length !== 8) return "Incorrect number of ranks";
        for (const row of rows) {
            let count = 0;
            for (const char of row) {
                if (/[1-8]/.test(char)) {
                    count += parseInt(char);
                } else if (/[rnbqkpRNBQKP]/.test(char)) {
                    count++;
                } else {
                    return "Unexpected character"; // Invalid character
                }
            }
            if (count !== 8) return "Incorrect number of files"; // Each row must have exactly 8 squares
        }

        // Validate active color
        if (activeColor !== 'w' && activeColor !== 'b') return "Active color must be 'w' or 'b'";
        // Validate castling rights
        if (!/^[KQkq-]*$/.test(castling)) return "Invalid castling rights";

        // Validate en passant square
        if (enPassant !== '-' && !/^[a-h][36]$/.test(enPassant)) return "Invalid en passant square (also, google it)";

        // Validate half-move and full-move counts
        if (!/^\d+$/.test(halfMove) || !/^\d+$/.test(fullMove)) return "Half-move and full-move counts must be non-negative integers";

        return undefined;
    }
}

export default WebSocketSingleton;
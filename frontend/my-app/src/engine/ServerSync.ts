import { GlobalBoard } from "../pages/Game";
import { GameConfig } from "../providers/GameConfigProvider";
import { ChessBoard, Move, PieceColor, Position } from "./ChessBoardLogic";

export enum MessageType {
    SYNC, //server-> client (sync info)
    SYNC_REQUEST, //client->server (request sync)
    MOVE, //client->server (carry out this move)
    CHAT, //bi-directional

    INIT_HOST_START, //client(table host)->server (starting game sent config)
    INIT_HOST_VS_AI_START, //client(table host)->server (wanna play vs AI)
    INIT_CLIENT_START, //client(table client)->server (connecting to this table)
    INIT_GO, //server->client (your game is now go)

    GAME_OVER, //server->client (game has concluded)
    GAME_RESIGN, //client->server (I resign)

    REG_SEND, //client->server (I exist, acknowledge, please)
    REG_ACKNOWLEDGE //server->client (Your existence has been acknowledged)
}

export type Message =
    | {
        clientID : string
        type: MessageType.REG_SEND;
        data: null;
    }
    | {
        clientID : string
        type: MessageType.CHAT;
        data: {
            message: string
        };
    }
    | {
        clientID : string
        type: MessageType.INIT_HOST_START;
        data: MessageStateSync;
    }
    | {
        clientID : string
        type: MessageType.INIT_HOST_VS_AI_START;
        data: MessageStateSync;
    }
    | {
        clientID : string
        type: MessageType.INIT_CLIENT_START;
        data: {
            gameID: string
        }
    }
    | {
        clientID : string
        type: MessageType.MOVE,
        data: {
            from: ServerPos,
            to: ServerPos
        }
    }
    | {
        clientID : string
        type: MessageType.GAME_RESIGN,
        data?: undefined
    }
    | {
        clientID : string
        type: MessageType.GAME_OVER
        data: GameOverData
    }
    | {
        clientID : string
        type: MessageType.SYNC,
        data: MessageStateSync
    }
    | {
        clientID : string
        type: MessageType.REG_ACKNOWLEDGE,
        data: null
    }
    | {
        clientID : string
        type: MessageType.SYNC_REQUEST,
        data: null
    }

export type ServerPos = {
    file: string,
    rank: number
}

type Register = {
    playerID: string
}

export type GameOverData = {
    reason: "Checkmate" | "Stalemate" | "Surrender" | "Connection Error" | "General",
    winner: PieceColor
}

export type MessageStateSync = {
    boardFen: string;
    playerToMove: string;
    whiteTime: number;
    blackTime: number;
    legalMoves?: string[];
    youAre: PieceColor
}

type QueueRecord = {
    waitFor: MessageType,
    onReceive: (data: any) => void;
}

export type SyncEvents = "onChat" | "onSync" | "onGameOver";


class Queue {
    queue: QueueRecord[] = []

    Enqueue(item: QueueRecord) {
        this.queue.push(item);
        console.log("Now waiting for: ", this.queue);

    }

    Dequeue(): QueueRecord | undefined {
        return this.queue.shift();
    }

    DequeueFor(type: MessageType): QueueRecord | undefined {
        let i = this.queue.findIndex(p => p.waitFor === type);
        if (i !== -1) {
            return this.queue.splice(i, 1)[0];
        }
        return undefined;
    }
}


export class ServerSync {

    private static instance: ServerSync;
    private socket: WebSocket | null = null;
    private queue: Queue = new Queue();
    private clientID : string = "145";


    private constructor() {
        this.socket = null;
        this.queue = new Queue();
    }

    public static get Instance(): ServerSync {
        if (!ServerSync.instance) {
            ServerSync.instance = new ServerSync();
        }
        return ServerSync.instance;
    }

    public async Enqueue(record: QueueRecord) {
        this.queue.Enqueue(record);
    }
    public Dequeue(): QueueRecord | undefined {
        return this.queue.Dequeue();
    }
    public DequeueFor(type: MessageType): QueueRecord | undefined {
        return this.queue.DequeueFor(type);
    }

    public async Connect(url: string) {
        if (this.socket) {
            console.error("Already connected to a server.");
            return;
        }
        this.queue = new Queue();
        this.socket = new WebSocket(url);
        this.listeners.clear();

        this.socket.onopen = () => {
            console.log("Connected to the server.");
        };

        this.socket.onmessage = (event) => {
            let message: Message = JSON.parse(event.data);
            this.ReceiveMessage(message);

        };

        this.socket.onclose = () => {
            console.log("Disconnected from the server.");
            this.socket = null;
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error: ", error);
        };
        await new Promise<void>((resolve) => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                resolve();
            } else if (this.socket) {
                this.socket.addEventListener("open", () => resolve(), { once: true });
            }
        });
    }

    private SendString(message: string): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not open. Cannot send message.");
            return;
        }
        this.socket.send(message);
    }

    private SendJSON(message: object): void {
        this.SendString(JSON.stringify(message));
    }

    private async WaitForMessage<K extends MessageType>(waitFor: K): Promise<Extract<Message, { type: K }> | undefined> {
        return new Promise(
            (resolve, reject) => {//TODO: implement reject
                this.Enqueue({
                    waitFor: waitFor,
                    onReceive(data) {
                        resolve(data);
                    },
                })
            }
        );
    }

    private async Send<K extends MessageType>(message: Omit<Message,"clientID">, waitFor?: K): Promise<Extract<Message, { type: K }> | undefined> {
        const message_ = {...message, clientID:this.clientID };
        if (waitFor !== undefined && waitFor !== null) {
            return new Promise(
                (resolve, reject) => {//TODO: implement reject
                    this.SendJSON(message_);
                    this.Enqueue({
                        waitFor: waitFor,
                        onReceive(data) {
                            resolve(data);
                        },
                    })
                }
            );
        }
        this.SendJSON(message_);
    }

    private Disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    public async GetSync(){
        return await this.Send({
            type: MessageType.SYNC_REQUEST,
            data:null
        }, MessageType.SYNC);
    }

    private async RegisterConnection() {
        return await this.Send({
            type: MessageType.REG_SEND,
            data: null,
        }, MessageType.REG_ACKNOWLEDGE);
    }

    public async InitGameAsHost(initCfg: GameConfig, isAI? : boolean, setStatus? :  (m : string)=>Promise<void>) {
        if(!setStatus) setStatus = async (s)=>{};
        await this.RegisterConnection();
        await setStatus("Logged in. Sending config...");
        let time = initCfg.time;
        let initGame: MessageStateSync = {
            blackTime: time ? time : 0,
            whiteTime: time ? time : 0,
            boardFen: initCfg.startPosition,
            playerToMove: initCfg.onlineThisPlayer,
            youAre: initCfg.onlineThisPlayer,
        }
        await this.Send({
            type: isAI ? MessageType.INIT_HOST_VS_AI_START : MessageType.INIT_HOST_START,
            data: initGame
        }, MessageType.INIT_GO);
        await setStatus("Game ready. Running initial sync...");
        this.Send({
            type: MessageType.SYNC_REQUEST,
            data:null
        }, MessageType.SYNC).then(e=>ChessBoard.MOVES_DIRTY_FIX = e!.data);
    }

    public async InitGameAsClient(gameId: string) {
        await this.RegisterConnection();
        await this.Send({
            type: MessageType.INIT_CLIENT_START,
            data: {
                gameID: gameId
            }
        }, MessageType.INIT_GO);
        let cfg = (await this.Send({
            type: MessageType.SYNC_REQUEST,
            data: null
        }, MessageType.SYNC))?.data;

        if (!cfg) {
            throw new Error("Connection failed!");
        }
        return cfg;
    }



    public SendMove(move: Move): void {
        this.Send({
            type: MessageType.MOVE,
            data: {
                from: move.from.ToServerPos(),
                to: move.to.ToServerPos()
            }
        });
    }
    public SendChatMessage(message: string): void {
        this.Send({
            type: MessageType.CHAT,
            data: {
                message: message
            }
        })
    }


    public Quit(): void {
        this.Send(
            {
                type: MessageType.GAME_RESIGN,
            }
        );
        this.Disconnect();
    }

    public ReceiveMessage(event: Message): void {
        let dequeued = this.DequeueFor(event.type);
        if (!dequeued) {
            switch (event.type) {
                case MessageType.CHAT:
                    this.emit<String>("onChat", event.data.message);
                    break;
                case MessageType.SYNC:
                    this.emit<MessageStateSync>("onSync", event.data);
                    break;
                case MessageType.GAME_OVER:
                    this.emit("onGameOver", event.data);
                    break;
            }
            //TODO: buffer?
            return;
        }
        dequeued.onReceive(event);
    }

    private listeners: Map<SyncEvents, EventCallback[]> = new Map();

    on<T = any>(event: SyncEvents, callback: EventCallback<T>) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);
    }

    off<T = any>(event: SyncEvents, callback: EventCallback<T>) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            this.listeners.set(
                event,
                handlers.filter(cb => cb !== callback)
            );
        }
    }

    emit<T = any>(event: SyncEvents, data: T) {
        this.listeners.get(event)?.forEach(cb => cb(data));
    }


}

export type EventCallback<T = any> = (data: T) => void;
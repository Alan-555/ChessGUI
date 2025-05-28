import { GlobalBoard } from "../pages/Game";
import { GameConfig } from "../providers/GameConfigProvider";
import { ChessBoard, Move, PieceColor, Position } from "./ChessBoardLogic";

export enum MessageType {
    SYNC, //server-> client (sync info)
    SYNC_REQUEST, //client->server (request sync)
    MOVE, //client->server (carry out this move)
    CHAT, //bi-directional

    INIT_HOST_START, //client(table host)->server (starting game sent config)
    INIT_HOST_WAIT, //server->client (wait for opponent to connect)
    INIT_HOST_VS_AI_START, //client(table host)->server (wanna play vs AI)
    INIT_CLIENT_START, //client(table client)->server (connecting to this table)
    INIT_GO, //server->client (your game is now go)

    GAME_OVER, //server->client (game has concluded)
    GAME_RESIGN, //client->server (I resign)

    REG_SEND, //client->server (I exist, acknowledge, please)
    REG_ACKNOWLEDGE, //server->client (Your existence has been acknowledged)

    CLIENT_ERROR, //server->client (error due to client)
    SERVER_ERROR  //server->client (server error)
}

export type Message =
    | {
        clientID: string
        type: MessageType.REG_SEND;
        data: null;
    }
    | {
        clientID: string
        type: MessageType.CHAT;
        data: {
            isServerMessage: boolean,
            message: string
        };
    }
    | {
        clientID: string
        type: MessageType.INIT_HOST_START;
        data: MessageStateSync;
    }
    | {
        clientID: string
        type: MessageType.INIT_HOST_VS_AI_START;
        data: MessageStateSync;
    }
    | {
        clientID: string
        type: MessageType.INIT_CLIENT_START;
        data: {
            gameID: string
        }
    }
    | {
        clientID: string
        type: MessageType.MOVE,
        data: {
            from: ServerPos,
            to: ServerPos
        }
    }
    | {
        clientID: string
        type: MessageType.GAME_RESIGN,
        data: null
    }
    | {
        clientID: string
        type: MessageType.GAME_OVER
        data: GameOverData
    }
    | {
        clientID: string
        type: MessageType.SYNC,
        data: MessageStateSync
    }
    | {
        clientID: string
        type: MessageType.REG_ACKNOWLEDGE,
        data: null
    }
    | {
        clientID: string
        type: MessageType.SYNC_REQUEST,
        data: null
    }
    | {
        clientID: string,
        type: MessageType.CLIENT_ERROR,
        data: {
            errType: ClientErrors,
            message?: ""
        }
    }
    | {
        clientID: string,
        type: MessageType.INIT_HOST_WAIT,
        data: string
    }

export type ClientErrors = "INVALID_ID";

export type ServerPos = {
    file: string,
    rank: number
}

type Register = {
    playerID: string
}

export type GameOverData = {
    reason: GameOverReason,
    winner: PieceColor | null;
}
export type GameOverReason = "CHECKMATE" | "STALEMATE" | "SURRENDER" | "CONN_ERROR" | "GENERAL" | "TIME_OUT" | "DRAW";

export type MessageStateSync = {
    boardFen: string;
    playerToMove: PieceColor;
    whiteTime: number;
    blackTime: number;
    legalMoves?: string[];
    youAre: PieceColor;
    sfDifficulty?: number; //AI difficulty, if applicable
    isInCheck?: boolean; //if the player to move is in check
}

type QueueRecord = {
    waitFor: MessageType,
    onReceive: (data: any) => void;
    rejectFor?: MessageType,
    onReject?: (data: any) => void;
}

export type SyncEvents = "onChat" | "onSync" | "onGameOver" | "surrender" | "onSystemChat" | "onClose";


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
    DequeueRejectFor(type: MessageType): QueueRecord | undefined {
        let i = this.queue.findIndex(p => p.rejectFor === type);
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
    private clientID: string = Math.floor(Math.random() * 1000).toString();

    public get IsConnected() {
        return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
    }

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
    public DequeueRejectFor(type: MessageType): QueueRecord | undefined {
        return this.queue.DequeueRejectFor(type);
    }
    public async Connect(url: string) {
        if (this.socket) {
            console.error("Already connected to a server.");
            return;
        }
        this.queue = new Queue();
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log("Connected to the server.");
        };

        this.socket.onmessage = (event) => {
            let message: Message = JSON.parse(event.data);
            this.ReceiveMessage(message);

        };

        this.socket.onclose = (e) => {
            console.log("Disconnected from the server.", e);
            this.socket = null;
            this.emit("onClose", e);
            this.listeners.clear();
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
    private async Send<K extends MessageType>(message: Omit<Message, "clientID">, waitFor?: K, rejectOn?: K): Promise<Extract<Message, { type: K }> | undefined> {
        if(!this.IsConnected){
            return;
        }
        const message_ = { ...message, clientID: this.clientID };
        if (waitFor !== undefined && waitFor !== null) {
            return new Promise(
                (resolve, reject) => {//TODO: implement reject
                    this.SendJSON(message_);
                    this.Enqueue({
                        waitFor: waitFor,
                        onReceive(data) {
                            resolve(data);
                        },
                        rejectFor: rejectOn,
                        onReject(data) {
                            reject(data);
                        }
                    });
                }
            );
        }
        this.SendJSON(message_);
    }

    private Disconnect(reason: string): void {
        if (this.socket) {
            this.socket.close(1000, reason);
            this.socket = null;
        }
    }

    public async GetSync() {
        return await this.Send({
            type: MessageType.SYNC_REQUEST,
            data: null
        }, MessageType.SYNC);
    }
    public async RequestSync() {
        return await this.Send({
            type: MessageType.SYNC_REQUEST,
            data: null
        });
    }
    public async Resign() {
        await this.Send({
            type: MessageType.GAME_RESIGN,
            data: null
        });
        this.Quit("Surrender event raised. Disconnecting...");
    }

    private async RegisterConnection() {
        return await this.Send({
            type: MessageType.REG_SEND,
            data: null,
        }, MessageType.REG_ACKNOWLEDGE);
    }

    public async InitGameAsHost(initCfg: GameConfig, isAI?: boolean, setStatus?: (m: string) => Promise<void>) {
        if (!setStatus) setStatus = async (s) => { };
        await this.RegisterConnection();
        await setStatus("Logged in. Sending config...");
        let time = initCfg.time;
        let initGame: MessageStateSync = {
            blackTime: time ? time : 0,
            whiteTime: time ? time : 0,
            boardFen: initCfg.startPosition,
            playerToMove: initCfg.onlineThisPlayer,
            youAre: initCfg.onlineThisPlayer,
            sfDifficulty: initCfg.sfDifficulty
        }
        let gameId = (await this.Send({
            type: isAI ? MessageType.INIT_HOST_VS_AI_START : MessageType.INIT_HOST_START,
            data: initGame
        }, isAI ? MessageType.INIT_GO : MessageType.INIT_HOST_WAIT, MessageType.CLIENT_ERROR))?.data;

        if(isAI){
            await setStatus("Game ready. Running initial sync...");
            return;
        }
        await setStatus("Table created with id" + gameId + ". Waiting for an opponent to join...");

        await this.WaitForMessage(MessageType.INIT_GO);

        await setStatus("Game ready. Running initial sync...");
    }

    public async InitGameAsClient(gameId: string, setStatus?: (m: string) => Promise<void>) {
        if (!setStatus) setStatus = async (s) => { };
        await this.RegisterConnection();
        await setStatus("Logged in. Joining table...");
        await this.Send({
            type: MessageType.INIT_CLIENT_START,
            data: {
                gameID: gameId
            }
        }, MessageType.INIT_GO, MessageType.CLIENT_ERROR);
        await setStatus("Connected! Running initial sync...");
        let cfg = (await this.Send({
            type: MessageType.SYNC_REQUEST,
            data: null
        }, MessageType.SYNC))?.data;

        if (!cfg) {
            throw new Error("Connection failed!");
        }
        await setStatus("Dispatch");
        this.Send({
            type: MessageType.SYNC_REQUEST,
            data: null
        });
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
                isServerMessage: false,
                message: message
            }
        })
    }


    public Quit(reason: string): void {
        // this.Send(
        //     {
        //         type: MessageType.GAME_RESIGN,
        //     }
        // );
        this.listeners.clear();
        this.Disconnect(reason);
    }

    public ReceiveMessage(event: Message): void {
        let dequeued = this.DequeueFor(event.type);
        let dequeuedReject = this.DequeueRejectFor(event.type);
        if (!dequeued && !dequeuedReject) {
            switch (event.type) {
                case MessageType.CHAT:
                    if (event.data.isServerMessage)
                        this.emit<String>("onSystemChat", event.data.message);
                    else
                        this.emit<String>("onChat", event.data.message);
                    break;
                case MessageType.SYNC:
                    this.emit<MessageStateSync>("onSync", event.data);
                    break;
                case MessageType.GAME_OVER:
                    this.emit("onGameOver", event.data);
                    this.Quit("Game concluded as to request by remote host. Client is disconnecting...");
                    break;
                case MessageType.GAME_RESIGN:
                    this.emit("surrender", undefined);
                    this.Quit("Game concluded as to request by remote host. Client is disconnecting...");
                    break;
                case MessageType.CLIENT_ERROR:
                    this.emit("onSystemChat",event.data.errType);
                    this.RequestSync();
                    break;
            }
            //TODO: buffer?
            return;
        }
        if (dequeued) {
            dequeued.onReceive(event);
        }
        else {
            dequeuedReject!.onReject!(event.data);
        }
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

    offAll(event: SyncEvents) {
        const handlers = this.listeners.get(event);
        if (handlers) {
            this.listeners.set(
                event,
                []
            );
        }
    }

    emit<T = any>(event: SyncEvents, data: T) {
        this.listeners.get(event)?.forEach(cb => cb(data));
    }


}

export type EventCallback<T = any> = (data: T) => void;
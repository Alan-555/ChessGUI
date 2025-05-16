import { PieceColor } from "./ChessBoardLogic";

export enum MessageType {
    SYNC,
    MOVE,
    CHAT,
    GAME_OVER,
    GAME_START,
    GAME_RESIGN,
}

export type Message = {
    type: MessageType;
    data: any;
}

type MessageGameStart = {
    localPlayer : PieceColor;
    startFen : string;
    opponentName : string;
    startTime : number;
}

type MessageStateSync = {
    boardFen : string;
    playerToMove : string;
    whiteTime : number;
    blackTime : number;
}


export class ServerSync {
    private static instance: ServerSync;
    private socket: WebSocket | null = null;

    private constructor() {
        this.socket = null;
    }

    public get Instance(): ServerSync {
        if (!ServerSync.instance) {
            ServerSync.instance = new ServerSync();
        }
        return ServerSync.instance;
    }

    public connect(url: string): void {
        if (this.socket) {
            console.error("Already connected to a server.");
            return;
        }

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log("Connected to the server.");
        };

        this.socket.onmessage = (event) => {
            let message: Message = event.data;

        };

        this.socket.onclose = () => {
            console.log("Disconnected from the server.");
            this.socket = null;
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error: ", error);
        };
    }

    private sendMessage(message: string): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not open. Cannot send message.");
            return;
        }
        this.socket.send(message);
    }

    private sendJSON(message: object): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not open. Cannot send message.");
            return;
        }
        this.socket.send(JSON.stringify(message));
    }

    private disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }   
    
    
    public sendMove(move: string): void {
        const message: Message = {
            type: MessageType.MOVE,
            data: move,
        };
        this.sendJSON(message);
    }
    public sendChatMessage(message: string): void {
        const chatMessage: Message = {
            type: MessageType.CHAT,
            data: message,
        };
        this.sendJSON(chatMessage);
    }
    public GameAction(action: MessageType): void {
        if(!MessageType[action].startsWith("GAME_")){
            console.error("Invalid game action.");
            return;
        }
        const message: Message = {
            type: action,
            data: null,
        };
        this.sendJSON(message);
    }

    public Quit(): void {
        const message: Message = {
            type: MessageType.GAME_RESIGN,
            data: null,
        };
        this.sendJSON(message);
        this.disconnect();
    }

    public receiveMessage(event: Message): void {
        switch (event.type) {
            case MessageType.SYNC:
                // Handle sync message
                break;
            case MessageType.MOVE:
                throw new Error("Invalid message. Expected to receive a sync message.");
                break;
            case MessageType.CHAT:
                // Handle chat message
                break;
            case MessageType.GAME_OVER:
                // Handle game over message
                break;
            case MessageType.GAME_START:
                // Handle game start message
                break;
            case MessageType.GAME_RESIGN:
                // Handle game resign message
                break;
        }
    }


}
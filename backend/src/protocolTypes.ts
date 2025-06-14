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
    GAME_DRAW_DECLARE, //client->server (I offer draw)

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
            isServerMessage : boolean
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
            to: ServerPos,
            suffix?:string
        }
    }
    | {
        clientID: string
        type: MessageType.GAME_RESIGN,
        data?: undefined
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
        type: MessageType.INIT_GO,
        data: null
    }
    | {
        clientID: string,
        type: MessageType.CLIENT_ERROR,
        data: {
            errType : ClientErrors,
            message?: ""
        }
    }
    | {
        clientID: string,
        type: MessageType.INIT_HOST_WAIT,
        data: string
    }
    | {
        clientID: string,
        type: MessageType.GAME_DRAW_DECLARE,
        data:null
    }

export type ClientErrors = "INVALID_ID" | "ILLEGAL_MOVE";

export type ServerPos = {
    file: string,
    rank: number
}

type Register = {
    playerID: string
}

export type GameOverData = {
    reason: GameOverReason,
    winner: PieceColor | null
}

export type GameOverReason = "CHECKMATE" | "STALEMATE" | "SURRENDER" | "CONN_ERROR" | "GENERAL" | "TIME_OUT" | "DRAW";

export type MessageStateSync = {
    boardFen: string;
    playerToMove: PieceColor;
    whiteTime: number; //actual time remaining in milliseconds
    blackTime: number;
    legalMoves?: string[];
    youAre: PieceColor;
    sfDifficulty?: number; //AI difficulty, if applicable
    isInCheck?: boolean; //if the player to move is in check
    moves : string[]
    clockPaused?: boolean; //if the clock is paused

    //server-side only
    useTime?: boolean,
    whiteStartTimestamp?: number; //timestamp when the white player started their half-turn
    blackStartTimestamp?: number; //timestamp when the black player started their half-turn
}

export type PieceColor = "white" | "black";

export type Move = {
    from: Position,
    to: Position
}

export type Position = {
    file: string,
    rank: number
}

export function GetServerMove(move: Move) {
    return move.from.file + move.from.rank + move.to.file + move.to.rank;
}

export function ParseServerMove(moveStr: string): Move {
    if (moveStr.length !== 4) {
        throw new Error("Invalid move string");
    }
    return {
        from: {
            file: moveStr[0],
            rank: parseInt(moveStr[1], 10)
        },
        to: {
            file: moveStr[2],
            rank: parseInt(moveStr[3], 10)
        }
    };
}

export const OtherColor = (color: PieceColor): PieceColor => color == "white" ? "black" : "white";
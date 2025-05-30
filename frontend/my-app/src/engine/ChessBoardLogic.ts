import React from "react";
import { GetPieceSrc } from "../resources";
import { GameConfig } from "../providers/GameConfigProvider";
import { MessageStateSync, ServerPos, ServerSync } from "./ServerSync";
import { number } from "framer-motion";
import { Chess } from "chess.js";

export enum PieceType {
    PAWN,
    KNIGHT,
    BISHOP,
    ROOK,
    QUEEN,
    KING
}

export type PieceColor = "white" | "black";

export type Piece = {
    type: PieceType;
    color: PieceColor;
    pieceRef: React.RefObject<HTMLImageElement | null>;
    file: number;
    rank: number;
    imgSrc: string;
    ghosted?: boolean; //Being dragged
};

export type Square = {
    piece: Piece | null;
    squareRef: React.RefObject<HTMLDivElement | null>;
    selected?: boolean; //Selected by click
    dummy?: boolean; //Used for editing
    inCheck?: boolean; //Used for king exclusively and if the king is in check
}

export class Position {
    file: number;
    rank: number;

    private constructor(file: number, rank: number) {
        this.file = file;
        this.rank = rank;
    }

    public static Position(file: number, rank: number): Position;
    public static Position(file: string, rank: number): Position;
    public static Position(piece: Piece): Position;

    public static Position(file: number | string | Piece, rank?: number): Position {
        if (typeof (file) == "number") {
            return new Position(file, rank!);
        }
        else if (typeof (file) == "object") {
            let p: Piece = file;
            return new Position(p.file, p.rank);
        }
        else {
            let file_ = file.charCodeAt(0) - "a".charCodeAt(0);
            return new Position(file_, 8 - rank!);
        }
    }

    public ToServerPos(promotionSuffix? : string): ServerPos {
        return {
            file: String.fromCharCode(this.file + "a".charCodeAt(0))+(promotionSuffix||""),
            rank: 8 - this.rank
        }
    }
    public ToServerPosString(): string {
        return (String.fromCharCode(this.file + "a".charCodeAt(0)) + (8 - this.rank));
    }



}

export type Move = {
    from: Position,
    to: Position
}



export class ChessBoard {
    private board!: Square[][];
    public get Board(): Square[][] { return this.board; }
    public set GameConfig(cfg: GameConfig) {
        this.GameConfig = cfg;
    }


    constructor(fen: string = "SP") {
        this.InitBoard(fen);
    }

    public currentSync?: MessageStateSync;


    public SetNewSync(sync: MessageStateSync) {
        this.currentSync = sync;
        if (sync.isInCheck) {
            // Find the king of the color in check and set inCheck=true
            for (let rank = 0; rank < 8; rank++) {
                for (let file = 0; file < 8; file++) {
                    const square = this.board[rank][file];
                    const piece = square.piece;
                    if (
                        piece &&
                        piece.type === PieceType.KING &&
                        piece.color === sync.playerToMove
                    ) {
                        square.inCheck = true;
                    } else if (square.inCheck) {
                        square.inCheck = false;
                    }
                }
            }
        } else {
            // Clear all inCheck flags
            for (let rank = 0; rank < 8; rank++) {
                for (let file = 0; file < 8; file++) {
                    const square = this.board[rank][file];
                    if (square.inCheck) {
                        square.inCheck = false;
                    }
                }
            }
        }
        console.log("Got new sync", sync);

    }

    isEditMode: boolean = false;

    public setNewVer: (n: number) => void = () => { };

    public InitBoard(fen: string = "SP", editMode: boolean = false) {
        this.isEditMode = editMode;
        const board: Square[][] = [];
        console.log("Init neww board with FEN: ", fen);

        // Default to starting position if "SP" is used
        const fenToParse = fen === "SP"
            ? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
            : fen.split(" ")[0];

        const rows = fenToParse.split("/");
        for (let rank = 0; rank < 8; rank++) {
            const row: Square[] = [];
            const fenRow = rows[rank];
            let file = 0;

            for (const char of fenRow) {
                if (IsDigit(char)) {
                    file += parseInt(char, 10); // Empty squares
                    for (let i = 0; i < parseInt(char, 10); i++) {
                        row.push({
                            piece: null,
                            squareRef: React.createRef<HTMLDivElement>(),
                        });
                    }
                } else {
                    const color: PieceColor = char === char.toUpperCase() ? "white" : "black";
                    const type = FenCharToPieceType(char.toLowerCase());

                    const piece: Piece = {
                        type,
                        color,
                        pieceRef: React.createRef<HTMLImageElement>(),
                        file,
                        rank,
                        imgSrc: GetPieceSrc(color, type),
                    };

                    row.push({
                        piece,
                        squareRef: React.createRef<HTMLDivElement>(),
                    });

                    file++;
                }
            }

            // Fill remaining squares with nulls (in case of malformed FEN)
            while (row.length < 8) {
                row.push({
                    piece: null,
                    squareRef: React.createRef<HTMLDivElement>(),
                });
            }

            board.push(row);
        }
        if (editMode)
            EditModeSetup(board);

        this.board = board;

    }

    public MovePiece(piece: Piece, to: { file: number; rank: number },suffix : string = "") {
        if (piece) {
            if (!this.IsMoveLegal(piece, to)) return;
            
            if (!this.isEditMode)
                ServerSync.Instance.SendMove({
                    from: Position.Position(piece), to: Position.Position(to.file, to.rank)
                }, suffix);
            if(this.currentSync)
                this.currentSync.legalMoves = [];

            if (this.board[to.rank][to.file].dummy) {
                this.board[piece.rank][piece.file].piece = null;
                return;
            }
            this.board[to.rank][to.file].piece = piece;
            this.board[piece.rank][piece.file].piece = null;
            piece.file = to.file;
            piece.rank = to.rank;


        }
    }

    public IsMoveLegal(piece: Piece, to: { file: number; rank: number }): boolean {
        if (this.isEditMode) return true;
        let moveStr = Position.Position(piece).ToServerPosString() + Position.Position(to.file, to.rank).ToServerPosString();
        if (!this.currentSync?.legalMoves) return false;
        return this.currentSync.legalMoves.some(s=>s.slice(0,4)===moveStr);
    }

    public GetLegalMoves(piece: Piece): Position[] {
        if (!this.currentSync || !this.currentSync.legalMoves) return [];
        let moves = this.currentSync.legalMoves;
        let piecePos = Position.Position(piece).ToServerPos();
        return moves
            .filter(p => p.startsWith(piecePos.file + piecePos.rank))
            .map<Position>(m => { return Position.Position(m[2], number.parse(m[3])) });


    }

    public SpawnPiece(type: PieceType, color: PieceColor): Piece {
        const piece: Piece = {
            type,
            color,
            pieceRef: React.createRef<HTMLImageElement>(),
            file: 0,
            rank: 8,
            imgSrc: GetPieceSrc(color, type),
        };
        this.board[8][0].piece = piece;
        return piece;
    }


    public CreateFen(): string {
        let fen = "";
        for (let rank = 0; rank < 8; rank++) {
            let emptyCount = 0;
            for (let file = 0; file < 8; file++) {
                const square = this.board[rank][file];
                if (square.piece) {
                    if (emptyCount > 0) {
                        fen += emptyCount;
                        emptyCount = 0;
                    }
                    const pieceChar = PieceTypeToFenChar(square.piece.type, square.piece.color);
                    fen += pieceChar;
                } else {
                    emptyCount++;
                }
            }
            if (emptyCount > 0) {
                fen += emptyCount;
            }
            if (rank < 7) {
                fen += "/";
            }
        }
        return fen;
    }

}



function IsDigit(char: string): boolean {
    return /\d/.test(char);
}

function FenCharToPieceType(char: string): PieceType {
    switch (char) {
        case "p": return PieceType.PAWN;
        case "n": return PieceType.KNIGHT;
        case "b": return PieceType.BISHOP;
        case "r": return PieceType.ROOK;
        case "q": return PieceType.QUEEN;
        case "k": return PieceType.KING;
        default: throw new Error(`Invalid piece character in FEN: ${char}`);
    }
}

function PieceTypeToFenChar(type: PieceType, color: PieceColor): string {
    switch (type) {
        case PieceType.PAWN: return color === "white" ? "P" : "p";
        case PieceType.KNIGHT: return color === "white" ? "N" : "n";
        case PieceType.BISHOP: return color === "white" ? "B" : "b";
        case PieceType.ROOK: return color === "white" ? "R" : "r";
        case PieceType.QUEEN: return color === "white" ? "Q" : "q";
        case PieceType.KING: return color === "white" ? "K" : "k";
        default: throw new Error(`Invalid piece type: ${type}`);
    }
}

function EditModeSetup(board: Square[][]) {
    board.push([
        {
            piece: null,
            squareRef: React.createRef<HTMLDivElement>(),
            dummy: true,
        }
    ]);
}

export function IsFenValid(fen: string): boolean {
    const regex = /^((?:[rnbqkpRNBQKP1-8]{1,8}\/){7}[rnbqkpRNBQKP1-8]{1,8}) (w|b) (K?Q?k?q?|-) ((?:[a-h][36])|-) (\d+) ([1-9]\d*)$/;
    return regex.test(fen) || regex.test(fen+" w - - 0 1");
}

export function GetMoveSAN(prevFen: string, newFen: string): string | null {
    if(prevFen === newFen) return null;
    const game = new Chess(prevFen);

    const possibleMoves = game.moves({ verbose: true });

    for (const move of possibleMoves) {
        const testGame = new Chess();
        testGame.load(prevFen);
        testGame.move(move);
        if (testGame.fen() === newFen) {
            return game.move(move).san;
        }
    }

    return null; // No matching move found
}

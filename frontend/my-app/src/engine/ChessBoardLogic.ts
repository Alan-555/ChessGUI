import React from "react";
import { GetPieceSrc } from "../resources";

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
    pieceRef: React.RefObject<HTMLImageElement|null>;
    file: number;
    rank: number;
    imgSrc : string;
    ghosted?: boolean; //Being dragged
};

export type DragContext = {
    piece: Piece | null;
    isDragging: boolean;
}

export type Square = {
    piece: Piece | null;
    squareRef: React.RefObject<HTMLDivElement|null>;
    selected?: boolean; //Selected by click
}

export class ChessBoard {
    private board: Square[][];
    public get Board() : Square[][]{return this.board;}

 

    constructor(fen : string = "SP") {

        this.board = this.InitBoard(fen);
        console.log("EEE");
        
    }

    private InitBoard(fen: string = "SP"): Square[][] {
        const board: Square[][] = [];

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
                        imgSrc : GetPieceSrc(color, type),
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

        return board;

    }

    public MovePieceRef(from: Piece, to: React.RefObject<HTMLDivElement|null>) {
        const fromSquare = this.board[from.rank][from.file];
        const toSquare = this.board[from.rank][from.file];

        if (fromSquare.piece && toSquare.squareRef.current) {
            toSquare.squareRef.current.appendChild(fromSquare.piece.pieceRef.current!);
            fromSquare.piece = null;
        }
    }

    public MovePiece(piece : Piece, to: { file: number; rank: number }) {
        if (piece) {
            this.board[to.rank][to.file].piece = piece;
            this.board[piece.rank][piece.file].piece = null;
            piece.file = to.file;
            piece.rank = to.rank;
        }
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
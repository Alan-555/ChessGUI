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
    visible: boolean;
};

export type Square = Piece | null;

export class ChessBoard{
    private board: Square[][];
    private size: number;

    constructor(size: number) {
        this.size = size;
        this.board = this.initializeBoard();
    }

    private initializeBoard(): Square[][] {
        return [
            [
                { type: PieceType.ROOK, color: "black" },
                { type: PieceType.KNIGHT, color: "black" },
                { type: PieceType.BISHOP, color: "black" },
                { type: PieceType.QUEEN, color: "black" },
                { type: PieceType.KING, color: "black" },
                { type: PieceType.BISHOP, color: "black" },
                { type: PieceType.KNIGHT, color: "black" },
                { type: PieceType.ROOK, color: "black" },
            ],
            Array(8).fill({ type: PieceType.PAWN, color: "black" }),
            ...Array(4).fill(Array(8).fill(null)),
            Array(8).fill({ type: PieceType.PAWN, color: "white" }),
            [
                { type: PieceType.ROOK, color: "white" },
                { type: PieceType.KNIGHT, color: "white" },
                { type: PieceType.BISHOP, color: "white" },
                { type: PieceType.QUEEN, color: "white" },
                { type: PieceType.KING, color: "white" },
                { type: PieceType.BISHOP, color: "white" },
                { type: PieceType.KNIGHT, color: "white" },
                { type: PieceType.ROOK, color: "white" },
            ],
        ];
    }	

    
}
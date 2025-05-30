import img_b_bishop from './resources/bishop-b.svg';
import img_b_king from './resources/king-b.svg';
import img_b_knight from './resources/knight-b.svg';
import img_b_pawn from './resources/pawn-b.svg';
import img_b_queen from './resources/queen-b.svg';
import img_b_rook from './resources/rook-b.svg';
import img_w_bishop from './resources/bishop-w.svg';
import img_w_king from './resources/king-w.svg';
import img_w_knight from './resources/knight-w.svg';
import img_w_pawn from './resources/pawn-w.svg';
import img_w_queen from './resources/queen-w.svg';
import img_w_rook from './resources/rook-w.svg';
import aud_take from './resources/take.wav';
import aud_check from './resources/check.wav';
import aud_move from './resources/move.wav';
import aud_chat from './resources/chat.wav';
import aud_gameOver from './resources/gameOver.mp3';

import img_menu from './resources/menu.jpg';

import { PieceColor, PieceType } from './engine/ChessBoardLogic';

export {
    img_b_bishop,
    img_b_king,
    img_b_knight,
    img_b_pawn,
    img_b_queen,
    img_b_rook,
    img_w_bishop,
    img_w_king,
    img_w_knight,
    img_w_pawn,
    img_w_queen,
    img_w_rook,

    img_menu
};

export{
    aud_take,
    aud_check,
    aud_move,
    aud_chat,
    aud_gameOver
}

export function GetPieceSrc(color_ : PieceColor, type : PieceType) {
    if(color_ === "white") {
        switch (type) {
            case PieceType.PAWN: return img_w_pawn;
            case PieceType.KNIGHT: return img_w_knight;
            case PieceType.BISHOP: return img_w_bishop;
            case PieceType.ROOK: return img_w_rook;
            case PieceType.QUEEN: return img_w_queen;
            case PieceType.KING: return img_w_king;
        }
    }
    else {
        switch (type) {
            case PieceType.PAWN: return img_b_pawn;
            case PieceType.KNIGHT: return img_b_knight;
            case PieceType.BISHOP: return img_b_bishop;
            case PieceType.ROOK: return img_b_rook;
            case PieceType.QUEEN: return img_b_queen;
            case PieceType.KING: return img_b_king;
        }
    }
}

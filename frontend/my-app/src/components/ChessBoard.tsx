import { Box, Grid, Image } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { img_b_bishop, img_b_king, img_b_knight, img_b_pawn, img_b_queen, img_b_rook } from "../resources";
import PieceDrag from "./PieceDrag";
import { BoardThemes, GetRenderSize, useGlobalConfig } from "../providers/GlobalConfigProvider";
import { ChessBoard, Piece, PieceType, Square } from "../engine/ChessBoardLogic";
import { useGameConfig } from "../providers/GameConfigProvider";
import SetupPieceSpawner from "./SetupPieceSpawner";
import { GlobalBoard } from "../pages/Game";
import GameMessage from "./GameMessage";


export type DragContext = {
    piece: Piece | null;
    isDragging: boolean;
    trueDrag?: boolean;
};

export type SelectContext = {
    square: Square | null;
    isSelected: boolean;
}



export default function ChessBoardComponent() {
    //const board = useRef<ChessBoard>(GlobalBoard);
    const [version, setVersion] = useState(0);
    const globalCfg = useGlobalConfig();
    const gameConfig = useGameConfig();
    const currentTheme = BoardThemes[globalCfg.config.render.theme];
    
    const board = {current:GlobalBoard};

    const [dragContext, setDragContext_] = useState<DragContext>({
        isDragging: false,
        piece: null,
    });
    const [selectContext, setSelectContext_] = useState<SelectContext>({
        square: null,
        isSelected: false,
    });

    const onTrueDrag = () => {
        setTimeout(() => {
            setSelectContext_({
                square: null,
                isSelected: false,
            })
        }, 0);
    }



    const setDragContext = (newContext: DragContext, dropPos: { x: number, y: number }) => {

        setDragContext_(newContext);
        if (newContext.isDragging) {
            newContext.piece!.ghosted = true;
            return;
        }
        if (dragContext.piece === null) return;
        dragContext.piece!.ghosted = false;
        let rankI = 0;
        for (let rank of board.current.Board) {
            let fileI = 0;
            for (let square of rank) {
                if (square.squareRef.current) {
                    const rect = square.squareRef.current.getBoundingClientRect();
                    const x = dropPos.x - rect.left;
                    const y = dropPos.y - rect.top;
                    const size = rect.right - rect.left;
                    if (x > 0 && x < size && y > 0 && y < size) {
                        if (dragContext.piece?.rank === rankI && dragContext.piece?.file === fileI) {
                            return;
                        }
                        board.current.MovePiece(dragContext.piece!, { file: fileI, rank: rankI });
                        return;
                    }
                }
                fileI++;
            }
            rankI++;
        }

    }
    const setSelectContext = (newContext: SelectContext) => {
        setSelectContext_(newContext); 

    }

    const IsClickValid = (piece: Piece | null) => {
        if (gameConfig?.GameMode == "BOARD_SETUP") return true;
        if (piece === null) return true;
        if (piece.color !== gameConfig?.onlineThisPlayer) return false;
        if(GlobalBoard.currentSync?.playerToMove!=gameConfig.onlineThisPlayer)return false;
        return true;
    }

    const endSelectionMove = (rank: number, file: number) => {
        if (selectContext.square?.piece?.rank === rank && selectContext.square?.piece?.file === file) return;
        board.current.MovePiece(selectContext.square!.piece!, { file: file, rank: rank });
        setSelectContext({
            square: null,
            isSelected: false,
        });
    }

    useEffect(() => {
        // define a custom handler function
        // for the contextmenu event
        const handleContextMenu = (e: Event) => {
            // prevent the right-click menu from appearing
            e.preventDefault()
        }

        // attach the event listener to 
        // the document object
        document.addEventListener("contextmenu", handleContextMenu)

        // clean up the event listener when 
        // the component unmounts
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu)
        }
    }, []);

    const blackOnBottom = globalCfg.config.render.preferredPlayerSide === "BottomMe" ? gameConfig?.onlineThisPlayer === 'black' : false;
    let sizePx = GetRenderSize();
    if (gameConfig?.GameMode === "BOARD_SETUP") {
        sizePx = `calc(100vh / 10)`;
    }
    const repeat = `repeat(8, ${sizePx})`;
    console.log("Board redraw...");
    const theBoard = blackOnBottom ? board.current.Board.slice().reverse() : board.current.Board;
    return (
        <>
            <Grid templateColumns={repeat} templateRows={repeat} gap={0}>
                
                <PieceDrag dragContext={dragContext} setDragContext={setDragContext} onTrueDrag={onTrueDrag}></PieceDrag>
                {theBoard.map((row, rowIndex) =>
                    row.map((square, colIndex) => {
                        if (blackOnBottom && colIndex === 0) {
                            rowIndex = 7 - rowIndex;
                        }
                        const isDark = (rowIndex + colIndex) % 2 === 1;
                        let style = isDark ? currentTheme.darkSquareStyles : currentTheme.lightSquareStyles;
                        const isSelected = selectContext.isSelected && selectContext.square === square;
                        if(isSelected)
                            style = {...style,background: "rgb(100, 181, 246)"};
                        if(square.inCheck&&square.piece){
                            style = {...style,background: "red"};
                        }
                        if (selectContext.square?.piece)
                            if (board.current.GetLegalMoves(selectContext.square?.piece).some(x => x.file === colIndex && x.rank === rowIndex)) {
                                style = {...style,background: "green"};

                            }
                        const pieceImg = square != null ? square.piece?.imgSrc : null;

                        return (
                            <Box
                                style={style}
                                key={`${rowIndex}-${colIndex}`}
                                w={sizePx}
                                h={sizePx}
                                display={square.dummy ? "none" : "flex"}
                                alignItems="center"
                                justifyContent="center"
                                onDrag={e => e.preventDefault()}
                                onDragStart={e => e.preventDefault()}
                                onClick={e => {
                                    e.preventDefault();
                                    if (dragContext.isDragging) return;
                                    if (selectContext.isSelected)
                                        endSelectionMove(rowIndex, colIndex);

                                }}
                                ref={square?.squareRef}
                            >
                                {pieceImg && (
                                    <Image
                                        src={pieceImg}
                                        alt={`${square?.piece?.color}${square?.piece?.type}`}
                                        pointerEvents={IsClickValid(square.piece) ? "all" : "none"}
                                        onMouseDown={e => {
                                            if (!IsClickValid(square.piece)) return;
                                            e.preventDefault();

                                            if (e.button === 2 && gameConfig?.GameMode == "BOARD_SETUP") {
                                                board.current.MovePiece(square.piece!, { file: 0, rank: 8 });
                                                setSelectContext({
                                                    isSelected: false,
                                                    square: null,
                                                });
                                                return;

                                            }
                                            setDragContext({
                                                isDragging: true,
                                                piece: square.piece,
                                            },
                                                { x: 0, y: 0 }
                                            );
                                        }}
                                        onMouseUp={e => {
                                            if (!IsClickValid(square.piece)) return;
                                            e.preventDefault();
                                            setSelectContext({
                                                isSelected: true,
                                                square: square,
                                            });
                                            setDragContext({
                                                isDragging: false,
                                                piece: null,
                                            },
                                                { x: 0, y: 0 }
                                            );

                                        }}
                                        ref={square?.piece?.pieceRef}
                                        opacity={square.piece?.ghosted ? 0.5 : 1}
                                        w="80%"
                                        h="80%"
                                    />
                                )}
                            </Box>
                        );
                    })
                )}
            </Grid>
            {gameConfig?.GameMode === "BOARD_SETUP" && (
                SetupPieceSpawner({ board: board.current, setDragContext: setDragContext })
            )}
        </>
    );
}


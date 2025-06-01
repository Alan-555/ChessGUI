import { Box, Grid, Image, useBoolean } from "@chakra-ui/react";
import { CSSProperties, useEffect, useState } from "react";
import PieceDrag from "./PieceDrag";
import { BoardThemes, GetRenderSize, useGlobalConfig } from "../providers/GlobalConfigProvider";
import { Piece, PieceType, Square } from "../engine/ChessBoardLogic";
import { useGameConfig } from "../providers/GameConfigProvider";
import SetupPieceSpawner from "./SetupPieceSpawner";
import { GlobalBoard } from "../pages/Game";
import { Overlay } from "./Overlay";
import Promotion from "./Promotion";


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
    const globalCfg = useGlobalConfig();
    const gameConfig = useGameConfig();

    const currentTheme = BoardThemes[globalCfg.config.render.theme];
    const board = { current: GlobalBoard };


    const [selectPromotionPopup, setSelection] = useBoolean(false);
    const [selectPromotionMove, setMove] = useState<{ piece: Piece, to: { file: number; rank: number } }>()


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

    const movePiece = (piece: Piece, to: { file: number; rank: number }) => {
        if (!GlobalBoard.isEditMode && piece.type === PieceType.PAWN && (to.rank === 0 || to.rank === 7) && GlobalBoard.IsMoveLegal(piece, to)) {
            setMove({ piece: piece, to: to });
            setSelection.on();
            return;
        }
        board.current.MovePiece(piece, to);
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
                        movePiece(dragContext.piece!, { file: fileI, rank: rankI });
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
        if (gameConfig?.GameMode === "BOARD_SETUP") return true;
        if (piece === null) return true;
        if (piece.color !== gameConfig?.onlineThisPlayer) return false;
        if (GlobalBoard.currentSync?.playerToMove !== gameConfig.onlineThisPlayer) return false;
        return true;
    }

    const endSelectionMove = (rank: number, file: number) => {
        if (selectContext.square?.piece?.rank === rank && selectContext.square?.piece?.file === file) return;
        movePiece(selectContext.square!.piece!, { file: file, rank: rank });
        setSelectContext({
            square: null,
            isSelected: false,
        });
    }

    useEffect(() => {
        const handleContextMenu = (e: Event) => {
            e.preventDefault()
        }
        document.addEventListener("contextmenu", handleContextMenu)
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
                <Overlay show={selectPromotionPopup} hideConfirm={true} >
                    <Promotion color={selectPromotionMove?.piece.color} onSelect={e => { GlobalBoard.MovePiece(selectPromotionMove!.piece, selectPromotionMove!.to, e); setSelection.off() }}></Promotion>
                </Overlay>
                {theBoard.map((row, rowIndex) =>
                    row.map((square, colIndex) => {
                        if (blackOnBottom && colIndex === 0) {
                            rowIndex = 7 - rowIndex;
                        }
                        const isDark = (rowIndex + colIndex) % 2 === 1;
                        let style = isDark ? currentTheme.darkSquareStyles : currentTheme.lightSquareStyles;
                        let highlightStyle: CSSProperties | undefined = undefined;
                        const isSelected = selectContext.isSelected && selectContext.square === square;
                        const pieceImg = square != null ? square.piece?.imgSrc : null;
                        if (isSelected)
                            highlightStyle = { background: "gray", opacity: "0.3", transform: "scale(1)", borderRadius: "50%" };
                        if (square.inCheck && square.piece) {
                            highlightStyle = { background: "radial-gradient(circle,rgba(255, 0, 0, 1) 0%, rgba(248, 32, 32, 0) 70%, rgba(0, 0, 0, 0) 100%)", opacity: "1", transform: "scale(1.1)", borderRadius: "100%", zIndex: "1" };
                        }
                        if (selectContext.square?.piece)
                            if (board.current.GetLegalMoves(selectContext.square?.piece).some(x => x.file === colIndex && x.rank === rowIndex)) {
                                if (pieceImg)
                                    highlightStyle = { background: "radial-gradient(circle,rgb(0, 251, 239) 0%, rgba(248, 32, 32, 0) 90%, rgba(0, 0, 0, 0) 100%)", opacity: "0.5", transform: "scale(1)", borderRadius: "100%" };
                                else
                                    highlightStyle = { background: "radial-gradient(circle,rgb(0, 251, 255) 0%, rgba(248, 32, 32, 0) 90%, rgba(0, 0, 0, 0) 100%)", opacity: "0.5", transform: "scale(0.3)", borderRadius: "100%" };

                            }

                        return (
                            <Box
                                position={"relative"}
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
                                        zIndex={"10"}
                                        onMouseDown={e => {
                                            if (!IsClickValid(square.piece)) return;
                                            e.preventDefault();

                                            if (e.button === 2 && gameConfig?.GameMode === "BOARD_SETUP") {
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
                                {highlightStyle && (

                                    <div style={{ ...highlightStyle, width: "100%", height: "100%", position: "absolute" }}>

                                    </div>
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


import { Box, Grid, Image } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { img_b_bishop, img_b_king } from "../resources";
import PieceDrag from "./PieceDrag";
import { useGlobalConfig } from "../providers/GlobalConfigProvider";
import { ChessBoard, DragContext } from "../engine/ChessBoardLogic";

const board_ : ChessBoard = new ChessBoard("SP");

export default function ChessBoardComponent() {
    const board = useRef<ChessBoard>(board_);
    const [version, setVersion] = useState(0);
    const globalCfg = useGlobalConfig();
    const [dragContext, setDragContext_] = useState<DragContext>({
        isDragging: false,
        piece: null,
    });
    const setDragContext = (newContext: DragContext, dropPos : {x:number, y:number}) => {
        setDragContext_(newContext);
        if (newContext.isDragging) {
            newContext.piece!.ghosted = true;
            return;
        }
        let rankI = 0;
        for(let rank of board.current.Board) {
            let fileI = 0;
            for(let square of rank) {
                if(square.squareRef.current) {
                    const rect = square.squareRef.current.getBoundingClientRect();
                    const x = dropPos.x - rect.left;
                    const y = dropPos.y - rect.top;
                    if(x > 0 && x < globalCfg.render.imgSize && y > 0 && y < globalCfg.render.imgSize) {
                        if(dragContext.piece?.rank===rankI && dragContext.piece?.file===fileI) {
                            return;
                        }
                        board.current.MovePiece(dragContext.piece!, {file:fileI, rank:rankI});
                        return;
                    }
                }
                fileI++;
            }
            rankI++;
        }

    }
    const sizePx = `${globalCfg.render.imgSize}px`;
    const repeat = `repeat(8, ${sizePx})`;

    return (
        <Grid templateColumns={repeat} templateRows={repeat} gap={0}>
            <PieceDrag dragContext={dragContext} setDragContext={setDragContext}></PieceDrag>
            {board.current.Board.map((row, rowIndex) =>
                row.map((square, colIndex) => {
                    const isDark = (rowIndex + colIndex) % 2 === 1;
                    const bg = isDark ? "gray.700" : "gray.200";

                    const pieceImg =
                        square != null ? square.piece?.imgSrc : null;

                    return (
                        <Box
                            key={`${rowIndex}-${colIndex}`}
                            bg={bg}
                            w={sizePx}
                            h={sizePx}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            onDrag={e => e.preventDefault()}
                            onDragStart={e => e.preventDefault()}
                            ref={square?.squareRef}
                        >
                            {pieceImg && (
                                <Image
                                    src={pieceImg}
                                    alt={`${square?.piece?.color}${square?.piece?.type}`}
                                    onMouseDown={e => {
                                        e.preventDefault();
                                        setDragContext({
                                            isDragging: true,
                                            piece: square.piece,
                                        },
                                        {x:0,y:0});
                                    }}
                                    ref={square?.piece?.pieceRef}
                                    w="80%"
                                    h="80%"
                                />
                            )}
                        </Box>
                    );
                })
            )}
        </Grid>
    );
}

import { Box, Grid, Image } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { img_b_bishop } from "../resources";

type Piece = { type: string; color: "w" | "b" };
type Square = Piece | null;

const initialBoard: Square[][] = [
    [
        { type: "r", color: "b" },
        { type: "n", color: "b" },
        { type: "b", color: "b" },
        { type: "q", color: "b" },
        { type: "k", color: "b" },
        { type: "b", color: "b" },
        { type: "n", color: "b" },
        { type: "r", color: "b" },
    ],
    Array(8).fill({ type: "p", color: "b" }),
    ...Array(4).fill(Array(8).fill(null)),
    Array(8).fill({ type: "p", color: "w" }),
    [
        { type: "r", color: "w" },
        { type: "n", color: "w" },
        { type: "b", color: "w" },
        { type: "q", color: "w" },
        { type: "k", color: "w" },
        { type: "b", color: "w" },
        { type: "n", color: "w" },
        { type: "r", color: "w" },
    ],
];

export default function ChessBoard() {
    const [board, setBoard] = useState<Square[][]>(initialBoard);
    const size : number = 100; // Size of each square in pixels
    const dragPieceRef = useRef<HTMLImageElement>(null);
    const sizePx = `${size}px`;
    const repeat = `repeat(8, ${sizePx})`;
    const update = ()=>{
        if (dragPieceRef.current) {
            dragPieceRef.current.style.left = ``;
            dragPieceRef.current.style.top = ``;
        }
    }
    return (
        <Grid templateColumns={repeat} templateRows={repeat} gap={0}>
            
            <Image src={img_b_bishop} alt="Chess Piece" width="100px" height="100px" position="absolute" ref={dragPieceRef}/>
            {board.map((row, rowIndex) =>
                row.map((square, colIndex) => {
                    const isDark = (rowIndex + colIndex) % 2 === 1;
                    const bg = isDark ? "gray.700" : "gray.200";

                    const pieceImg =
                        square != null ? img_b_bishop : null;

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
                        >
                            {pieceImg && (
                                <Image
                                    src={pieceImg}
                                    alt={`${square?.color}${square?.type}`}
                                    onDrag={e => e.preventDefault()}
                                    onDragStart={e => e.preventDefault()}

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

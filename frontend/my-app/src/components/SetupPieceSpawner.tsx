import { Box, Image } from "@chakra-ui/react";
import { ChessBoard, PieceType } from "../engine/ChessBoardLogic";
import { img_b_pawn, img_b_knight, img_b_bishop, img_b_rook, img_b_queen, img_b_king, img_w_pawn, img_w_bishop, img_w_king, img_w_knight, img_w_queen, img_w_rook } from "../resources";
import { useState } from "react";



function SetupPieceSpawner({ board, setDragContext }: { board: ChessBoard, setDragContext: (newContext: { isDragging: boolean, piece: any }, dropPos: { x: number, y: number }) => void }) {
    const [selectedColor, setSelectedColor] = useState<"black" | "white">("black");

    return (
        <>
            <Box
                position="fixed"
                top="10px"
                left="50%"
                transform="translateX(-50%)"
                display="flex"
                flexDirection="row"
                gap="20px"
            >
                
                <Box
                    bg={selectedColor === "black" ? "gray.700" : "gray.300"}
                    color="white"
                    p="10px"
                    borderRadius="md"
                    boxShadow="md"
                    cursor="pointer"
                    onClick={() => setSelectedColor("black")}
                >
                    Black
                </Box>
                <Box
                    bg={selectedColor === "white" ? "gray.700" : "gray.300"}
                    color="white"
                    p="10px"
                    borderRadius="md"
                    boxShadow="md"
                    cursor="pointer"
                    onClick={() => setSelectedColor("white")}
                >
                    White
                </Box>
                
                {[
                    { type: 0, img: selectedColor === "black" ? img_b_pawn : img_w_pawn },
                    { type: 1, img: selectedColor === "black" ? img_b_knight : img_w_knight },
                    { type: 2, img: selectedColor === "black" ? img_b_bishop : img_w_bishop },
                    { type: 3, img: selectedColor === "black" ? img_b_rook : img_w_rook },
                    { type: 4, img: selectedColor === "black" ? img_b_queen : img_w_queen },
                    { type: 5, img: selectedColor === "black" ? img_b_king : img_w_king }
                ].map((piece) => (
                    <Box
                        key={piece.type}
                        bg="gray.300"
                        p="10px"
                        borderRadius="md"
                        boxShadow="md"
                        cursor="pointer"
                        onMouseDown={e => {
                            e.preventDefault();

                            let pieceInstance = board.SpawnPiece(piece.type as PieceType, selectedColor);
                            setDragContext({
                                isDragging: true,
                                piece: pieceInstance,
                            },
                                { x: 0, y: 0 }
                            );
                        }}
                    >
                        <Image
                            src={piece.img}
                            alt={piece.img}
                            w="40px"
                            h="40px"
                        />
                    </Box>
                ))}
                <p style={{width:"100%", textAlign:"center", position:"absolute", top:"70px"}}>Right click to remove a piece</p>
            </Box>
        </>
    )
}

export default SetupPieceSpawner;
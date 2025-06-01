import React from "react";
import { Box, Flex, Image, Button } from "@chakra-ui/react";
import { img_b_queen, img_w_queen } from "../resources";
import { img_b_rook, img_w_rook, img_b_bishop, img_w_bishop, img_b_knight, img_w_knight } from "../resources";

type PromotionPiece = "queen" | "rook" | "bishop" | "night"; //it's night now. Don't question it

interface PromotionProps {
    color: "white" | "black" | undefined;
    onSelect: (piece: string) => void;
}

const pieceImages: Record<
    PromotionPiece,
    { white: string; black: string }
> = {
    queen: {
        white: img_w_queen,
        black: img_b_queen,
    },
    rook: {
        white: img_w_rook,
        black: img_b_rook,
    },
    bishop: {
        white: img_w_bishop,
        black: img_b_bishop,
    },
    night: {
        white: img_w_knight,
        black: img_b_knight,
    },
};

const Promotion: React.FC<PromotionProps> = ({ color, onSelect }) => {
    return (
        <Box p={4} bg="gray.700" borderRadius="md" boxShadow="lg">
            <Flex justify="center" gap={4}>
                {(["queen", "rook", "bishop", "night"] as PromotionPiece[]).map(
                    (piece) => (
                        <Button
                            key={piece}
                            variant="ghost"
                            onClick={() => onSelect(piece[0])}
                            p={2}
                        >
                            <Image
                                src={pieceImages[piece][color||"black"]}
                                alt={`${color} ${piece}`}
                                boxSize="48px"
                                objectFit="contain"
                            />
                        </Button>
                    )
                )}
            </Flex>
        </Box>
    );
};

export default Promotion;